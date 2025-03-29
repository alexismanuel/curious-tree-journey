/**
 * Enregistre une valeur dans le localStorage
 * @param key - Le nom de la clé sous laquelle stocker la valeur
 * @param value - La valeur à stocker (peut être de n'importe quel type)
 */
export function saveToLocalStorage(key: string, value: any): void {
    try {
      // Pour les objets et tableaux, il faut les convertir en chaîne JSON
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      // Enregistrement dans le localStorage
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement dans localStorage:', error);
    }
  }
  
/**
 * Récupère une valeur depuis le localStorage
 * @param key - Le nom de la clé à récupérer
 * @param defaultValue - Valeur par défaut si la clé n'existe pas
 * @returns La valeur récupérée, ou la valeur par défaut si non trouvée
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
    const item = localStorage.getItem(key);
    
    // Si aucune valeur n'est trouvée, retourne la valeur par défaut
    if (item === null) return defaultValue;
    
    // Tente de parser la valeur comme JSON, sinon la retourne telle quelle
    try {
        return JSON.parse(item);
    } catch {
        // Si ce n'est pas du JSON valide, retourne la chaîne directement
        return item as unknown as T;
    }
    } catch (error) {
    console.error('Erreur lors de la récupération depuis localStorage:', error);
    return defaultValue;
    }
}