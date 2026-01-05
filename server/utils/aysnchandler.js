import { Request, Response, NextFunction, RequestHandler } from "express";

module.exports.AsyncHandler = (fn) => {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
