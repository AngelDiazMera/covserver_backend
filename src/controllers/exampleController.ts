import { Request, Response } from 'express';

import ExampleModel, { Example } from '../models/Example';


export const getExamples = async (req: Request, res: Response): Promise<void> => {
    try {
        const examples: Example[] = await ExampleModel.find();
        res.json({examples});
    } catch (error) {
        res.json({error: error}).status(500);
    }
};

export const saveExample = async (req: Request, res: Response): Promise<void> => {
    const { title, description } = req.body;
    const example: Example = new ExampleModel({ title, description });
    await example.save();
    res.send('Example saved on database');
}


// Encapsules the controller methods into one class
// class ExampleController {

//     public async index (req: Request, res: Response): Promise<void> {
//         const examples: Example[] = await ExampleModel.find();
//         res.json({examples});
//     }

//     public async saveExample(req: Request, res: Response): Promise<void>{
//         const { title, description } = req.body;
//         const example: Example = new ExampleModel({ title, description });
//         await example.save();
//         res.send('Example saved on database');
//     }

// }

// we could define an object an define all methods inside, then, it could be exported

// export const exampleController = new ExampleController();