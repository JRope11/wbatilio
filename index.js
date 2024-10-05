require('dotenv').config();
const axios = require('axios');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Tu Account SID de Twilio
const authToken = process.env.TWILIO_AUTH_TOKEN; // Tu Auth Token de Twilio
const client = twilio(accountSid, authToken);

const openaiApiKey = process.env.OPENAI_API_KEY; // Tu clave API de OpenAI

// Manejar solicitudes entrantes desde Twilio
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const incomingMessage = req.body.Body.toLowerCase(); // Mensaje recibido en WhatsApp
    const from = req.body.From; // Remitente del mensaje (número de teléfono)

    // Verificar si el mensaje contiene la palabra "Atilio"
    if (incomingMessage.includes('atilio')) {
        try {
            // Enviar el mensaje a la API de ChatGPT
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: incomingMessage }],
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                }
            });

            const botReply = response.data.choices[0].message.content;

            // Enviar la respuesta de ChatGPT a través de Twilio
            await client.messages.create({
                body: botReply,
                from: 'whatsapp:+14155238886', // El número de WhatsApp de Twilio
                to: from, // El número del usuario que envió el mensaje
            });

            res.status(200).send('Mensaje recibido');
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
            res.status(500).send('Hubo un error');
        }
    } else {
        // Si el mensaje no contiene "Atilio", no responde
        res.status(200).send('Mensaje no relevante');
    }
});

// Iniciar el servidor en un puerto específico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});
