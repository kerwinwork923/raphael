export const DB: string[] = []
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log("API Token value:", body.token);
  // Save the token to db
  DB.push(body.token as string)

  return { status: 'success' };
});
