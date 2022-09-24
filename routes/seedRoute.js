import express from 'express'
import data from '../data.js';
import Formations from '../models/formationsModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
    await Cars.remove({});
    const createdCars = await Formations.insertMany(data.cars);

    res.send({createdCars});
});

export default seedRouter;