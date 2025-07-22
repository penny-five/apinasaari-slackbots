import * as path from 'node:path';

import { App, TerraformStack, LocalBackend } from 'cdktf';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as z from 'zod';

import { HcloudProvider } from './.gen/providers/hcloud/provider';
import { Firewall } from './.gen/providers/hcloud/firewall';
import { PrimaryIp } from './.gen/providers/hcloud/primary-ip';
import { Server } from './.gen/providers/hcloud/server';
import { SshKey } from './.gen/providers/hcloud/ssh-key';
import { NullProvider } from './.gen/providers/null/provider';
import { Resource as NullResource } from './.gen/providers/null/resource';
import { loadCloudConfig, loadSshKey } from './utils';

dotenv.config();

const envSchema = z.object({
  TF_HCLOUD_TOKEN: z.string().min(1, 'HCLOUD_TOKEN must be provided'),
  TF_ADMIN_SSH_KEY: z.string().min(1, 'ADMIN_SSH_KEY must be provided'),
  TF_TRUSTED_ADMIN_IPS: z
    .string()
    .min(1, 'TRUSTED_ADMIN_IPS must be provided')
    .transform(val => val.split(','))
    .pipe(z.array(z.cidrv4().or(z.ipv4())))
});

const validationResult = envSchema.parse(process.env);

const { TF_HCLOUD_TOKEN, TF_ADMIN_SSH_KEY, TF_TRUSTED_ADMIN_IPS } = validationResult;

class ApinasaariSlackbotsStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new NullProvider(this, 'null');

    new HcloudProvider(this, 'hcloud', {
      token: TF_HCLOUD_TOKEN
    });

    const adminKey = loadSshKey(TF_ADMIN_SSH_KEY);

    const sshKey = new SshKey(this, `admin_ssh_key_${adminKey.comment}`, {
      name: `admin-ssh-key-${adminKey.comment}`,
      publicKey: adminKey.publicKey
    });

    const firewall = new Firewall(this, 'n8n_server_fw', {
      name: 'n8n-server-fw',
      rule: [
        {
          direction: 'in',
          protocol: 'tcp',
          port: '22',
          sourceIps: TF_TRUSTED_ADMIN_IPS,
          description: 'Allow SSH from trusted admin IPs'
        },
        {
          direction: 'in',
          protocol: 'tcp',
          port: '5678',
          sourceIps: TF_TRUSTED_ADMIN_IPS,
          description: 'Allow n8n admin access from trusted admin IPs'
        },
        {
          direction: 'in',
          protocol: 'tcp',
          port: '80',
          sourceIps: ['0.0.0.0/0'],
          description: 'Allow HTTP'
        },
        {
          direction: 'in',
          protocol: 'tcp',
          port: '443',
          sourceIps: ['0.0.0.0/0'],
          description: 'Allow HTTPS'
        }
      ]
    });

    const primaryIp = new PrimaryIp(this, 'n8n_server_ip', {
      name: 'n8n-4gb-hel-1-ip',
      type: 'ipv4',
      assigneeType: 'server',
      datacenter: 'hel1-dc2', // Helsinki, Finland
      autoDelete: false
    });

    const cloudConfig = loadCloudConfig(path.resolve(__dirname, '..', './config/cloud-config.yaml'), {
      templateParams: {
        ssh_public_key: adminKey.publicKey
      }
    });

    const server = new Server(this, 'n8n_server', {
      name: 'n8n-4gb-hel-1',
      image: 'debian-12', // Debian 12 (Bookworm)
      serverType: 'cx22', // 2 vCPUs, 4 GB RAM, 40 GB SSD
      location: 'hel1', // Helsinki, Finland
      firewallIds: [firewall.id as any],
      userData: cloudConfig,
      sshKeys: [sshKey.id],
      publicNet: [
        {
          ipv4Enabled: true,
          ipv4: primaryIp.id as any,
          ipv6Enabled: false
        }
      ],
      labels: {
        app: 'n8n',
        environment: 'production'
      }
    });

    new NullResource(this, 'update_server', {
      provisioners: [
        {
          type: 'remote-exec',
          connection: {
            type: 'ssh',
            host: primaryIp.ipAddress,
            user: 'admin',
            privateKey: adminKey.privateKey
          },
          inline: ['cd /opt/apinasaari-slackbots && sh update.sh']
        }
      ],
      triggers: {
        always: new Date().toISOString()
      },
      dependsOn: [server]
    });
  }
}

const app = new App();

const stack = new ApinasaariSlackbotsStack(app, 'apinasaari-slackbots-prod');

new LocalBackend(stack);

app.synth();
