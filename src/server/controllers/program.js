import { ProgramTemplate } from "../utils/templateBuilder";
import { SpreadSheet } from "../utils/spreadsheetBuilder";

/**
 * Generates a google sheets 5-3-1 program
 * @param {*} ctx - koa context object
 *
 */
export const program = async ctx => {
  const { daysPerWeek, movements, name } = ctx.request.body;
  ctx.body = await SpreadSheet(ProgramTemplate(daysPerWeek, movements), name);
  ctx.status = 200;
};
