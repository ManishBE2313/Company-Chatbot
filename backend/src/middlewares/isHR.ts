const isHR = (req: any, res: any, next: any) => {
  if (req.user.role !== "hr" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only HR/Admin can create employee",
    });
  }
  next();
};