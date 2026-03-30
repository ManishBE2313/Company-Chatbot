import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
const JWT_SECRET = process.env.JWT_SECRET!;

export function employeeAuth(req: any, res: Response, next: NextFunction) {
  try {
    console.log("eAuth middleware hit");

    let token = req.cookies?.authcookie1;
   
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    if (token.startsWith("Bearer ")) {
  token = token.split(" ")[1];
}
    console.log("token avaialable")
    const decoded = jwt.verify(token, JWT_SECRET);
     console.log("decoded cookie", decoded)
    req.user = decoded; 

    next();
  } catch (error: any) {
  console.log("JWT ERROR:", error);
  return res.status(401).json({
    message: "Invalid token",
    error: error.message,
  });
}
}