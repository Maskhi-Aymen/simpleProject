import express from 'express';
import multer from 'multer';
import Formations from '../models/formationsModel.js';
import User from '../models/userModel.js';
import path from 'path';
import fs from 'fs';
import xl from 'excel4node';
import mime from 'mime';

const headerColumns = ["Nom", "Prénom", "E-mail", "Tel", "Date"]


const createExcelFile = (data, inscri, title) => {
    const wb = new xl.Workbook();
    var style = wb.createStyle({
        font: {
            color: "#ff1616",
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    const ws = wb.addWorksheet("Pré-inscription");
    let colindex = 1;
    headerColumns.forEach((item) => {
        ws.cell(1, colindex++).string(item).style(style)
    })
    let rowIndex = 2;
    data.forEach((item) => {
        let columnIndex = 1;
        Object.keys(item).forEach((colName) => {
            ws.cell(rowIndex, columnIndex++).string(item[colName]);
        })
        rowIndex++;
    })
    const wk = wb.addWorksheet("Inscription-Validée");
    let colind = 1;
    headerColumns.forEach((item) => {
        wk.cell(1, colind++).string(item).style(style)
    })
    let rowInd = 2;
    inscri.forEach((item) => {
        let columnIndex = 1;
        Object.keys(item).forEach((colName) => {
            wk.cell(rowInd, columnIndex++).string(item[colName]);
        })
        rowInd++;
    })
    wb.write("Inscription-" + title + ".xlsx")

}




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const fileFiltre = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false)
    }
}
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 }, fileFilter: fileFiltre });
const formationsRouter = express.Router();

formationsRouter.get('/getall', async (req, res) => {
    const formation = await Formations.find();
    res.send(formation);
});

formationsRouter.get('/excel/:userID/:carId', async (req, res) => {

    try {
        const formation = await Formations.findById({ _id: req.params.carId });
        if (formation) {
            const preinscri = [];
            const inscri = [];
            formation.inscription.map(function (x) {
                if (!x.f_valid) {
                    const info = {}; info["Nom"] = x.f_name;
                    info["Prénom"] = x.f_lastname; info["E-mail"] = x.f_email; info["Tel"] = x.f_tel; info["Date"] = x.f_date; preinscri.push(info)
                } else {
                    const info = {}; info["Nom"] = x.f_name;
                    info["Prénom"] = x.f_lastname; info["E-mail"] = x.f_email; info["Tel"] = x.f_tel; info["Date"] = x.f_date; inscri.push(info)
                }
            });

            createExcelFile(preinscri, inscri, formation["title"]);
            setTimeout(() => {
                res.download("./Inscription-" + formation["title"] + ".xlsx");
            }, 2000);            
        } else {
            res.status(404).send({ message: 'formation Not Found' });
        }
    } catch (error) {
        console.log(error)
        res.send({
            message: error,
        })
    }


});
//get car by id
formationsRouter.get('/:carId', async (req, res) => {
    try {
        const car = await Formations.findById({ _id: req.params.carId });
        if (car) {
            res.send(car)
        } else {
            res.status(404).send({ message: 'formation Not Found' });
        }
    } catch (error) {
        res.send({
            message: "erreur",
        })

    }

});
formationsRouter.post('/add/:userId', upload.single('img'), async (req, res) => {
    const user = await User.findById({ _id: req.params.userId });
    if (user) {
        if (user.admin) {
            try {
                const newFormation = new Formations({
                    title: req.body.title,
                    type: req.body.type,
                    participant: req.body.participant,
                    time: req.body.time,
                    imgUrl: req.body.imgUrl,
                    price: req.body.price,
                    formateur: req.body.formateur,
                    lieu: req.body.lieu,
                    duration: req.body.duration,
                    description: req.body.description,
                    inscription: [],
                });
                const formation = await newFormation.save();

                res.send({
                    message: "sucess",
                })
            } catch (error) {
                res.send({
                    message: "erreur",
                })

            }
        }
    }
    else {
        res.send({
            message: "erreur",
        })
    }
});

formationsRouter.put('/formation/:userId/:carId', upload.single('img'), async (req, res) => {
    const user = await User.findById({ _id: req.params.userId });
    if (user) {
        if (user.admin) {
            const car = await Formations.findByIdAndUpdate({ _id: req.params.carId }, req.body);
            if (car) {

                res.send({
                    message: "update succes",
                })
            } else {
                res.status(404).send({ message: 'formation Not Found' });
            }
        }
    } else {
        res.status(404).send({ message: 'formation Not Found' });
    }
});

formationsRouter.post('/inscription/:carId', async (req, res) => {
    const car = await Formations.findById({ _id: req.params.carId });
    const inscription = ({
        f_name: req.body.name,
        f_date: req.body.date,
        f_lastname: req.body.lastname,
        f_tel: req.body.numtel,
        f_email: req.body.email,
        f_valid: false,
    });
    if (car) {
        car.inscription.push(inscription);
        car.save();
        res.send({
            message: "update succes",
        })
    } else {
        res.status(404).send({ message: 'formation Not Found' });
    }
});
formationsRouter.put('/inscription/:userId/:carId/:insId', async (req, res) => {
    const user = await User.findById({ _id: req.params.userId });
    if (user) {
        if (user.admin) {
            const formation = await Formations.findById({ _id: req.params.carId });
            const inscrId = req.params.insId;
            if (formation) {
                const comment = formation.inscription.map(function (x) { if (x._id == inscrId) { x.f_valid = true; return x; } else return x })
                const form2 = await Formations.findByIdAndUpdate({ _id: req.params.carId }, { inscription: comment });
                res.send({ "message": "succes" })
            } else {
                res.status(404).send({ message: 'formation Not Found' });
            }
        }
    }
    else {
        res.status(404).send({ message: 'formation Not Found' });
    }
});

formationsRouter.delete('/inscription/:userId/:carId/:insId', async (req, res) => {
    const user = await User.findById({ _id: req.params.userId });
    if (user) {
        if (user.admin) {
            const formation = await Formations.findById({ _id: req.params.carId });
            const userId = req.params.insId;
            if (formation) {
                const comment = formation.inscription.filter(function (x) { if (x._id != userId) return x; })
                const form2 = await Formations.findByIdAndUpdate({ _id: req.params.carId }, { inscription: comment });
                res.send({ "message": "succes" })
            } else {
                res.status(404).send({ message: 'formation Not Found' });
            }
        }
    }
    else {
        res.status(404).send({ message: 'formation Not Found' });
    }
});

formationsRouter.delete('/formation/:userId/:carId', async (req, res) => {
    const user = await User.findById({ _id: req.params.userId });
    if (user) {
        if (user.admin) {
            const cdd = await Formations.findById({ _id: req.params.carId });
            if (cdd) {
                const img = cdd['imgUrl'].substring(30)
                if (img) {
                    const oldPath = path.join("uploads", img);
                    if (fs.existsSync(oldPath)) {
                        fs.unlink(oldPath, (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    }
                }
                const car = await Formations.deleteOne({ _id: req.params.carId });

                res.send({
                    message: "delete succes"
                })
            } else {
                res.status(404).send({ message: 'formation Not Found' });
            }
        }
    }
    else {
        res.status(404).send({ message: 'formation Not Found' });
    }

});



export default formationsRouter;

/*   */