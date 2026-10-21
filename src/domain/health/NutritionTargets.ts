import type { HealthGoals } from './Goals'

export interface DailyCap {
  key: string
  label: string
  value: string
  hint: string
  sourceKey: 'whoHealthyDiet' | 'emroFatSaltSugar'
}

/** Converts percent-of-energy goals into grams using 9 kcal/g for fat and 4 kcal/g for sugar. */
export class NutritionTargets {
  constructor(
    private readonly energy: number,
    private readonly goals: HealthGoals,
  ) {}

  private grams(percent: number, kcalPerGram: number): number {
    return Math.round((this.energy * percent) / 100 / kcalPerGram)
  }

  get freeSugarGrams(): number {
    return this.grams(this.goals.freeSugarPercent, 4)
  }

  get idealFreeSugarGrams(): number {
    return this.grams(5, 4)
  }

  get saturatedFatGrams(): number {
    return this.grams(this.goals.saturatedFatPercent, 9)
  }

  get transFatGrams(): number {
    return Math.round(((this.energy * this.goals.transFatPercent) / 100 / 9) * 10) / 10
  }

  get totalFatGrams(): number {
    return this.grams(this.goals.totalFatPercent, 9)
  }

  caps(): DailyCap[] {
    return [
      {
        key: 'sugar',
        label: 'قند آزاد',
        value: `کمتر از ${this.goals.freeSugarPercent}٪ انرژی (حدود ${this.freeSugarGrams} گرم)`,
        hint: `کمتر از ۵٪ (حدود ${this.idealFreeSugarGrams} گرم) فایدهٔ بیشتری دارد.`,
        sourceKey: 'whoHealthyDiet',
      },
      {
        key: 'salt',
        label: 'نمک',
        value: `کمتر از ${this.goals.saltGrams} گرم در روز`,
        hint: 'معادل کمتر از ۲ گرم سدیم.',
        sourceKey: 'whoHealthyDiet',
      },
      {
        key: 'sat',
        label: 'چربی اشباع',
        value: `کمتر از ${this.goals.saturatedFatPercent}٪ انرژی (حدود ${this.saturatedFatGrams} گرم)`,
        hint: 'کره، چربی گوشت، روغن نارگیل و پالم، خامه، پنیر.',
        sourceKey: 'emroFatSaltSugar',
      },
      {
        key: 'trans',
        label: 'چربی ترانس',
        value: `کمتر از ${this.goals.transFatPercent}٪ انرژی (حدود ${this.transFatGrams} گرم)`,
        hint: 'در غذاهای فرآوری‌شده، فست‌فود، سرخ‌شده، پیتزای فریز، کلوچه و مارگارین.',
        sourceKey: 'emroFatSaltSugar',
      },
      {
        key: 'fat',
        label: 'کل چربی',
        value: `حداکثر ${this.goals.totalFatPercent}٪ انرژی (حدود ${this.totalFatGrams} گرم)`,
        hint: '',
        sourceKey: 'emroFatSaltSugar',
      },
    ]
  }
}

export var ALTERNATIVES: string[] = [
  'میوه و سبزی خام به‌جای تنقلات شیرین',
  'چربی‌های غیراشباع از ماهی، آووکادو، آجیل و روغن زیتون',
  'پخت با بخارپز، آب‌پز یا فر به‌جای سرخ‌کردن',
  'نمک را سر سفره نگذارید و برچسب سدیم محصولات را بخوانید',
]
