import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { seedInsurancePartners, seedAppointmentsForExistingPets } from "../server/seedData";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initApp() {
  if (initialized) return;
  initialized = true;
  await seedInsurancePartners().catch(console.error);
  await seedAppointmentsForExistingPets().catch(console.error);
  await registerRoutes(app);
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });
}

export default async function handler(req: Request, res: Response) {
  await initApp();
  app(req, res);
}
