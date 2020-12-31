export interface MemeTemplate {
  id: string;
  label: string;
  filename: string;
  width: number;
  height: number;
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
  }
];

export const getAllTemplates = () => TEMPLATES;

export const findTemplateById = (id: string) => TEMPLATES.find(template => template.id === id);
