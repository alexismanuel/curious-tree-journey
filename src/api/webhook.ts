/**
 * Envoie une requête POST vers le webhook de Make avec la variable `create_course`
 * et retourne la réponse du webhook.
 *
 * @param create_course - La donnée à transmettre au webhook.
 * @returns La réponse du webhook convertie en JSON.
 */
async function sendCreateCourse(create_course: any): Promise<any> {
    try {
        const response = await fetch('https://hook.eu1.make.com/ihmym1n82oq1hqb7sa83fa5n5mwa8v48', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ create_course })
        });

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        // Conversion de la réponse en JSON et retour
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel du webhook:', error);
        throw error;
    }
}