const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initialiseDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at 3000!!!");
    });
  } catch (e) {
    console.log(`Server error ${e.message}`);
    process.exit(1);
  }
};

initialiseDbandServer();

//get method API-1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API -2 get method

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const tododetailsquery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const res1 = await db.get(tododetailsquery);
  response.send(res1);
});

//API-3 post method

app.post("/todos/", async (request, response) => {
  const tododetails = request.body;
  const { id, todo, priority, status } = tododetails;
  const insertquery = `INSERT INTO todo (id, todo, priority, status) VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;

  const res2 = await db.run(insertquery);
  response.send("Todo Successfully Added");
});

//API-4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const reqbody = request.body;
  let updatecolumn = "";

  switch (true) {
    case reqbody.status !== undefined:
      updatecolumn = "Status";
      break;
    case reqbody.priority !== undefined:
      updatecolumn = "Priority";
      break;
    case reqbody.todo !== undefined:
      updatecolumn = "Todo";
      break;
  }
  const totalvaluesquery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const resvalue = await db.get(totalvaluesquery);

  const {
    todo = resvalue.todo,
    status = resvalue.status,
    priority = resvalue.priority,
  } = reqbody;
  const updatequery = `UPDATE todo SET 
    todo = '${todo}', status = '${status}',priority = '${priority}' WHERE id = ${todoId};`;

  await db.run(updatequery);
  response.send(`${updatecolumn} Updated`);
});

//API-5 delete method
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `DELETE FROM todo WHERE id = ${todoId};`;
  const res4 = await db.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = app;
