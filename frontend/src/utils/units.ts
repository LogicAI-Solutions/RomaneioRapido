// src/utils/units.ts

/**
 * Lista das unidades de medida que são estritamente inteiras.
 * Ou seja, não faz sentido vender 1.5 destas unidades.
 * 
 * Se precisar adicionar novas unidades inteiras no sistema, basta adicionar aqui.
 */
export const INTEGER_UNITS = ['UN', 'PCT', 'CX', 'CXS', 'FD', 'KIT', 'PC', 'DZ']

/**
 * Verifica se a unidade informada aceita apenas números inteiros.
 * @param unit A string da unidade (Ex: "UN", "KG", "m²")
 * @returns boolean indicando se é uma unidade inteira
 */
export const isIntegerUnit = (unit: string | null | undefined): boolean => {
    if (!unit) return false;
    return INTEGER_UNITS.includes(unit.trim().toUpperCase());
}
