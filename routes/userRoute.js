import express from 'express'
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';


const userRouter = express.Router();

//for login user
userRouter.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email});
    //if user exists
    if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            if(user.admin){
                res.send({
                    _id: user._id,
                    username: user.username,
                    admin:true,
                });
            }
            else{
            res.send({
                _id: user._id,
                username: user.username
            });}
            return;
        }
        return;
    }
    res.status(401).send({ message: "Invalid Email or Password" });
});

//for register user
userRouter.post("/register", async (req, res) => {
    try{
    const newUser = new User({
        username: req.body.username,
        email:req.body.email,
        password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
         message:"success"
    })}
    catch(error){
        res.send({
             message:"error"
        })
    }
});

userRouter.get("/download", async (req, res) => {
res.download("./CATALOGUE-IMNT-2022.pdf");
    });
userRouter.post("/contact", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const content = req.body.content;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "imnt.webservice@gmail.com", // generated ethereal user
            pass: 'oiolmmhuxvdnyxas', // generated ethereal password
        },
    });

    // send mail with defined transport object
    const msg = await transporter.sendMail({
        from: 'imnt.webservice@gmail.com', // sender address
        to: "aymenmaskhi@gmail.com", // imnt.formation@gmail.com
        subject: "Contact Site Web "+name, // Subject line
        html: `<div>${content}</div><h4>envoyee par:${name} avec le mail :${email}</h4>`, // html body
    });
    res.send('Email sent!')
});

userRouter.post("/reserve", async (req, res) => {
    const { name, lastname, email, numtel, lieuprise, dateprise, timeprise, lieureprise, datereprise, timereprise, nombrepers, nombrebag, payment, autre, carName, brand } = req.body;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "imnt.webservice@gmail.com", // generated ethereal user
            pass: 'oiolmmhuxvdnyxas', // generated ethereal password
        },
    });
    const info = `<center>
                <table>
                    <thead>
                        <tr>
                            <th colspan="3">Demande de Réservation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Nom: </td>
                            <td></td>
                            <td>${name}</td>
                        </tr>
                                <tr>
                            <td>Prénom: </td>
                            <td></td>
                            <td>${lastname}</td>
                        </tr>
                                <tr>
                            <td>E-mail: </td>
                            <td></td>
                            <td>${email}</td>
                        </tr>
                                <tr>
                            <td>Tel: </td>
                            <td></td>
                            <td>${numtel}</td>
                        </tr>
                        <tr>
                        <td>Model: </td>
                        <td></td>
                        <td>${brand}</td>
                            </tr>
                            <tr>
                            <td>Nom du voiture: </td>
                            <td></td>
                            <td>${carName}</td>
                        </tr>
                                <tr>
                            <td>Lieu de prise en charge: </td>
                            <td></td>
                            <td>${lieuprise}</td>
                        </tr>    
                             <tr>
                            <td>Date de prise en charge: </td>
                            <td></td>
                            <td>${dateprise}</td>
                        </tr>   
                              <tr>
                            <td>Heure de prise en charge: </td>
                            <td></td>
                            <td>${timeprise}</td>
                        </tr>
                                <tr>
                            <td>Lieu de restitution: </td>
                            <td></td>
                            <td>${lieureprise}</td>
                        </tr>
  
                                <tr>
                            <td>Date de restitution: </td>
                            <td></td>
                            <td>${datereprise}</td>
                        </tr>
   
                                <tr>
                            <td>Heure de restitution: </td>
                            <td></td>
                            <td>${timereprise}</td>
                        </tr>
                                <tr>
                            <td>Nombre de personne: </td>
                            <td></td>
                            <td>${nombrepers}</td>
                        </tr>
                                        <tr>
                            <td>Nombre de Baggage: </td>
                            <td></td>
                            <td>${nombrebag}</td>
                        </tr>
                                        <tr>
                            <td>Autre: </td>
                            <td></td>
                            <td>${autre}</td>
                        </tr>                <tr>
                            <td>Payment: </td>
                            <td></td>
                            <td>${payment}</td>
                        </tr>
                    </tbody>
                </table></center>
                <h2>Nous avons bien reçu votre demande et nous vous remercions de l’intérêt que vous portez à notre service.
                 Un membre de notre équipe entrera en contact avec vous dans les plus brefs délais</h2>`
    // send mail with defined transport object
    const msg = await transporter.sendMail({
        from: 'imnt.webservice@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Demande de Réservation✔", // Subject line
        html: info, // html body
    });

    console.log("Message sent: %s", msg.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(msg));
    res.send('Email sent!')
});

export default userRouter;