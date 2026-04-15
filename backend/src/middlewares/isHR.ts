export const isHR = (req: any, res: any, next: any) => {
  const role = req.user?.role;

  if (!role) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({
      message: "Only admin or superadmin can access this resource.",
    });
  }
  next();
};
