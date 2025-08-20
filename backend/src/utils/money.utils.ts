/**
 * Утилиты для работы с деньгами в минорных единицах
 * Решает проблему точности JavaScript с floating point числами
 */

export enum Currency {
    TRY = 'TRY',
    USD = 'USD',
    EUR = 'EUR',
}

/**
 * Получает минорную единицу для валюты
 */
export function getMinorUnit(currency: Currency): number {
    const minorUnits: Record<Currency, number> = {
        [Currency.TRY]: 100, // 1 TRY = 100 копеек
        [Currency.USD]: 100, // 1 USD = 100 центов
        [Currency.EUR]: 100, // 1 EUR = 100 центов
    };
    return minorUnits[currency];
}

/**
 * Получает символ валюты
 */
export function getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
        [Currency.TRY]: '₺',
        [Currency.USD]: '$',
        [Currency.EUR]: '€',
    };
    return symbols[currency];
}

/**
 * Конвертирует основную валюту в минорные единицы
 * @param amount - сумма в основной валюте (например, 10.50)
 * @param currency - валюта
 * @returns количество минорных единиц (например, 1050)
 */
export function toMinorUnits(amount: number, currency: Currency): number {
    const minorUnit = getMinorUnit(currency);
    return Math.round(amount * minorUnit);
}

/**
 * Конвертирует минорные единицы в основную валюту
 * @param minorUnits - количество минорных единиц (например, 1050)
 * @param currency - валюта
 * @returns сумма в основной валюте (например, 10.50)
 */
export function fromMinorUnits(minorUnits: number, currency: Currency): number {
    const minorUnit = getMinorUnit(currency);
    return minorUnits / minorUnit;
}

/**
 * Форматирует минорные единицы в читаемый вид
 * @param minorUnits - количество минорных единиц
 * @param currency - валюта
 * @returns отформатированная строка (например, "10.50 ₺")
 */
export function formatMinorUnits(minorUnits: number, currency: Currency): string {
    const amount = fromMinorUnits(minorUnits, currency);
    const symbol = getCurrencySymbol(currency);
    return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * Проверяет, что сумма в минорных единицах валидна
 * @param minorUnits - количество минорных единиц
 * @returns true если валидно
 */
export function isValidMinorUnits(minorUnits: number): boolean {
    return Number.isInteger(minorUnits) && minorUnits >= 0;
}

/**
 * Складывает две суммы в минорных единицах
 * @param a - первая сумма в минорных единицах
 * @param b - вторая сумма в минорных единицах
 * @returns результат в минорных единицах
 */
export function addMinorUnits(a: number, b: number): number {
    return a + b;
}

/**
 * Вычитает две суммы в минорных единицах
 * @param a - уменьшаемое в минорных единицах
 * @param b - вычитаемое в минорных единицах
 * @returns результат в минорных единицах
 */
export function subtractMinorUnits(a: number, b: number): number {
    return a - b;
}

// Обратная совместимость для TRY (копейки)
export const liraToKopecks = (lira: number) => toMinorUnits(lira, Currency.TRY);
export const kopecksToLira = (kopecks: number) => fromMinorUnits(kopecks, Currency.TRY);
export const formatKopecks = (kopecks: number) => formatMinorUnits(kopecks, Currency.TRY);
