require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');
const User = require('./models/User');
const Client = require('./models/Client');
const Contact = require('./models/Contact');
const Intervention = require('./models/Intervention');
const sendEmailFromEmailJS = require('./emailjs');
const { sendEmail, sendTemplatedEmail } = require('./nodemailer');
const nodemailer = require('nodemailer');
const auth = require('./authMiddleware');  // Adapte le chemin en fonction de l'endroit où tu as mis le fichier
const isAdmin= require('./authMiddleware');
const authMiddleware = require('./authMiddleware');



// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
//app.use(cors());
// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(fileUpload({
  useTempFiles: true,
}));

// Connexion à MongoDB
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// Route pour créer une intervention
// app.post('/interventions', async (req, res) => {
//   const { client, contact, details, date, priority, status } = req.body;

//   try {
//     if (!client || !contact || !details || !date || !priority) {
//       return res.status(400).json({ msg: 'Champs manquants' });
//     }

//     const newIntervention = new Intervention({
//       client,
//       contact,
//       details,
//       date,
//       priority,
//       status
//     });

//     await newIntervention.save();
//     res.status(201).json(newIntervention);
//   } catch (err) {
//     res.status(500).json({ msg: 'Erreur lors de la création de l\'intervention' });
//   }
// });
app.post('/interventions', auth, async (req, res) => {
  const { client, contact, details, date, priority, status } = req.body;

  try {
    if (!client || !contact || !details || !date || !priority) {
      return res.status(400).json({ msg: 'Champs manquants' });
    }

    const newIntervention = new Intervention({
      client,
      contact,
      details,
      date,
      priority,
      status,
      userId: req.user.id // l’ID de l’utilisateur connecté
    });

    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    console.error("Erreur lors de la création de l'intervention:", err);
    res.status(500).json({ msg: 'Erreur lors de la création de l\'intervention' });
  }
});



// Route pour récupérer toutes les interventions
app.get('/admin/interventions', isAdmin, async(req, res) => {
  try {
    const interventions = await Intervention.find().populate('client contact');
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des interventions' });
  }
});
// Route pour mettre à jour une intervention
app.put('/interventions/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Find the original document first
    const originalIntervention = await Intervention.findById(id);

    if (!originalIntervention) {
      return res.status(404).json({ msg: 'Intervention non trouvée' });
    }

    // Merge the updates with the original document fields
    const updatedInterventionData = {
      ...originalIntervention.toObject(), // Get all current field values
      ...updates, // Apply updates only to specified fields
    };

    // Perform the update with the merged data
    const updatedIntervention = await Intervention.findByIdAndUpdate(
      id,
      { $set: updatedInterventionData },
      { new: true }
    );

    res.json(updatedIntervention);
  } catch (err) {
    res.status(500).json({ msg: "Erreur lors de la modification de l'intervention" });
  }
});

// Route pour supprimer une intervention
app.delete('/interventions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedIntervention = await Intervention.findByIdAndDelete(id);
    if (!deletedIntervention) {
      return res.status(404).json({ msg: 'Intervention non trouvée' });
    }
    res.json({ msg: 'Intervention supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la suppression de l\'intervention' });
  }
});
// Route pour récupérer une intervention par ID
app.get('/interventions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const intervention = await Intervention.findById(id).populate('client contact');
    if (!intervention) {
      return res.status(404).json({ msg: 'Intervention non trouvée' });
    }
    res.json(intervention);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération de l\'intervention' });
  }
});


// Route to get interventions for the logged-in user
app.get('/interventions/user', auth, async (req, res) => {
  try {
    console.log("ID utilisateur dans la requête:", req.user.id);

    const interventions = await Intervention.find({ userId: req.user.id });
    console.log("Interventions trouvées:", interventions);

    if (!interventions || interventions.length === 0) {
      return res.status(404).json({ msg: "Aucune intervention trouvée pour cet utilisateur" });
    }

    res.json(interventions);
  } catch (err) {
    console.error("Erreur lors de la récupération des interventions de l'utilisateur:", err.stack || err);
    res.status(500).json({ msg: "Erreur lors de la récupération des interventions" });
  }  
});




// Route pour récupérer toutes les interventions
app.get('/interventions', async (req, res) => {
  try {
    const interventions = await Intervention.find().populate('client contact');
    res.json(interventions);
  } catch (err) {
    console.error("Erreur lors de la récupération des interventions:", err);
    res.status(500).json({ msg: "Erreur lors de la récupération des interventions" });
  }
});



// Route pour créer un client
app.post('/clients', async (req, res) => {
  const { name, email } = req.body;

  try {
    const client = new Client(req.body);
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

    });

// Route pour récupérer tous les clients
app.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find().populate('contact');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des clients' });
  }
});


// Mise à jour d'un client
app.put('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ msg: 'Client non trouvé' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du client' });
  }
});

// Suppression d'un client
app.delete('/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ msg: 'Client non trouvé' });
    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression du client' });
  }
});

// Route pour créer un contact
app.post('/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Route pour récupérer tous les contacts
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des contacts' });
  }
});
// Route pour modifier un contact
app.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ msg: 'Contact non trouvé' });
    }
    res.json(updatedContact);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la modification du contact' });
  }
});

// Route pour supprimer un contact
app.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ msg: 'Contact non trouvé' });
    }
    res.json({ msg: 'Contact supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la suppression du contact' });
  }
});



// Routes existantes pour l'inscription, la connexion, etc.
app.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  console.log('Données reçues:', req.body);

  if (!name || !email || !password || !phoneNumber) {
    return res.status(400).json({ msg: 'Veuillez fournir toutes les informations nécessaires.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà existant' });

    user = new User({ name, email, password, phoneNumber, role: 'user' });

    console.log('Utilisateur à sauvegarder:', user);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    console.log('Utilisateur avec mot de passe hashé:', user);

    await user.save();
    console.log('Utilisateur sauvegardé:', user);

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: 3600 });

    res.json({ msg: 'Compte créé avec succès. Redirection vers la page de connexion...', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: 3600 });
    res.json({ token, role: user.role }); // Send role with the token
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
});


app.post('/forgot-password', (req, res) => {
  const {email} = req.body;
  User.findOne({email: email})
  .then(user => {
      if(!user) {
          return res.send({Status: "User not existed"})
      } 
      const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'choukskander1@gmail.com',
            pass: 'fysh pnoi fxyk wxvt'
          }
        });
        
        var mailOptions = {
          from: 'youremail@gmail.com',
          to: 'user email@gmail.com',
          subject: 'Reset Password Link',
          text: `http://localhost:3000/reset_password/${user._id}/${token}`
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log('Erreur d\'envoi d\'email : ', error);
          } else {
            console.log('E-mail envoyé : ', info.response);
          }
        });
        
  })
})

app.post('/reset-password/:id/:token', (req, res) => {
  const {id, token} = req.params
  const {password} = req.body

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(password, 10)
          .then(hash => {
              UserModel.findByIdAndUpdate({_id: id}, {password: hash})
              .then(u => res.send({Status: "Success"}))
              .catch(err => res.send({Status: err}))
          })
          .catch(err => res.send({Status: err}))
      }
  })
})

// Route pour récupérer les informations du profil utilisateur
app.get('/users/profile', auth, async (req, res) => {
  try {
    // Utiliser l'ID de l'utilisateur extrait du token JWT via `req.user`
    const user = await User.findById(req.user.id).select('-password');  // Ne pas envoyer le mot de passe

    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }

    res.json(user);  // Envoyer les informations de l'utilisateur
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
});


// Route pour mettre à jour le profil utilisateur

app.put('/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.companyLocation = req.body.companyLocation || user.companyLocation;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber; // Ajout du téléphone

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // Gestion de l'image de profil (Cloudinary)
    if (req.files && req.files.profileImage) {
      const result = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath);
      user.profileImage = result.secure_url;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      companyLocation: updatedUser.companyLocation,
      phoneNumber: updatedUser.phoneNumber, // Retourne le téléphone
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
});


app.get('/', (req, res) => {
  res.send('Bonjour le monde !');
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});