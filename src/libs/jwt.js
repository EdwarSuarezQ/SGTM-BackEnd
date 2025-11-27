import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRE } from "../config.js";

export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRE || "15m",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

export const createRefreshToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { ...payload, type: "refresh" },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          reject(new Error("Token expirado"));
        } else if (err.name === "JsonWebTokenError") {
          reject(new Error("Token inválido"));
        } else {
          reject(err);
        }
      } else {
        resolve(decoded);
      }
    });
  });
};

export const getTokenFromHeaders = (headers) => {
  if (headers && headers.authorization) {
    const parts = headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }
  }
  return null;
};
