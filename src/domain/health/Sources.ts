export interface SourceRef {
  readonly id: string
  readonly title: string
  readonly url: string
}

export var SOURCES = {
  whoHealthyDiet: {
    id: 'who-healthy-diet',
    title: 'WHO - Healthy diet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
  },
  emroFatSaltSugar: {
    id: 'emro-fat-salt-sugar',
    title: 'WHO EMRO - Limit fat, salt and sugar intake',
    url: 'https://www.emro.who.int/nutrition/reduce-fat-salt-and-sugar-intake/reduce-fat-salt-and-sugar-intake.html',
  },
  whoPhysicalActivity: {
    id: 'who-physical-activity',
    title: 'WHO - Physical activity',
    url: 'https://www.who.int/initiatives/behealthy/physical-activity',
  },
  whoSedentary: {
    id: 'who-sedentary',
    title: 'WHO - Guidelines on physical activity and sedentary behaviour',
    url: 'https://www.who.int/publications/b/55518',
  },
  hopkinsScreenings: {
    id: 'hopkins-screenings',
    title: 'Johns Hopkins - Routine screenings',
    url: 'https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/routine-screenings',
  },
  clevelandGuidelines: {
    id: 'cleveland-guidelines',
    title: 'Cleveland Clinic - Adult screening guidelines',
    url: 'https://www.clevelandclinic.org/total-rewards/documents/Health-Maintenance-Guidelines.pdf',
  },
} as const satisfies Record<string, SourceRef>
