export interface MemeTemplate {
  id: string;
  label: string;
  filename: string;
  width: number;
  height: number;
  textColor?: string;
  strokeColor?: string;
  fontWeight?: 'regular' | 'bold';
  textAlign?: 'left' | 'center';
  textAreas: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }[];
}

const TEMPLATES: MemeTemplate[] = [
  {
    id: 'puh',
    label: 'Porvari Puh',
    filename: 'puh.png',
    width: 800,
    height: 582,
    textAreas: [
      {
        top: 0,
        right: 799,
        bottom: 292,
        left: 345
      },
      {
        top: 296,
        right: 799,
        bottom: 580,
        left: 345
      }
    ]
  },
  {
    id: 'vince',
    label: 'Vince',
    filename: 'vince.png',
    width: 609,
    height: 1026,
    textAreas: [
      {
        top: 0,
        right: 298,
        bottom: 250,
        left: 0
      },
      {
        top: 256,
        right: 298,
        bottom: 498,
        left: 0
      },
      {
        top: 505,
        right: 298,
        bottom: 764,
        left: 0
      },
      {
        top: 770,
        right: 298,
        bottom: 1026,
        left: 0
      }
    ]
  },
  {
    id: 'expanding-brain',
    label: 'Expanding brain',
    filename: 'expanding-brain.png',
    width: 498,
    height: 700,
    textAreas: [
      {
        top: 0,
        right: 246,
        bottom: 174,
        left: 0
      },
      {
        top: 176,
        right: 246,
        bottom: 352,
        left: 0
      },
      {
        top: 355,
        right: 246,
        bottom: 513,
        left: 0
      },
      {
        top: 520,
        right: 246,
        bottom: 700,
        left: 0
      }
    ]
  },
  {
    id: 'roll-safe',
    label: 'Roll safe',
    filename: 'roll-safe.png',
    width: 650,
    height: 365,
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    textAreas: [
      {
        top: 0,
        right: 650,
        bottom: 120,
        left: 0
      },
      {
        top: 245,
        right: 650,
        bottom: 365,
        left: 0
      }
    ]
  }
];

export const getAllTemplates = () => TEMPLATES;

export const findTemplateById = (id: string) => TEMPLATES.find(template => template.id === id);
