import * as fs from 'node:fs';

export const loadSshKey = (keyPath: string) => {
  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const publicKey = fs.readFileSync(`${keyPath}.pub`, 'utf8');

  return {
    privateKey: privateKey.trim(),
    publicKey: publicKey.trim(),
    comment: publicKey.split(' ')[2] // Extract comment from public key
  };
};

export const loadCloudConfig = (cloudConfigPath: string, config: { templateParams: Record<string, string> }) => {
  let template = fs.readFileSync(cloudConfigPath, 'utf8');
  // Poor man's templating a'la ${key} replacement
  for (const [key, value] of Object.entries(config.templateParams)) {
    template = template.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }

  return template;
};
