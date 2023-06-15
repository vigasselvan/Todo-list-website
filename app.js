//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
  name : String
};

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

//creating docs
const item1 = new Item({
  name: "Welcome to your todoList."
});

const item2 = new Item({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [ item1, item2, item3];


app.get("/", function(req, res) {
  
  Item.find().then(docs => {
      
      //if no task is mentioned, defaultly 'defaultItems' is displayed
      if(docs.length == 0){
        Item.insertMany(defaultItems).then(result => {
          console.log("Entered successfully!");
          }) 
          .catch(err => {
            console.log(err);
          });
        //recalling the same function, since now certain docs are inserted, else will be called and render the docs in list page.
        res.redirect('/')
      }else{
        res.render("list", {listTitle: "Today", newListItems: docs});
      }  
  }).catch(err => {
      console.error(err);
    });
  
});

app.post("/", function(req, res){

  //item entered is taken and inserted in DBs and redirecting it to '/' to print the new inserted docs in the list.
  const newTask = req.body.newItem;
  const task = new Item ({
    name: newTask
  });
  task.save();
  res.redirect('/');

});

app.post("/delete", function(req, res){
  
  console.log(req.body.checkbox);
  const delItem = req.body.checkbox;
  //to delete the doc selected.
  Item.findByIdAndRemove(delItem).then(result => {
      console.log(result);
      res.redirect("/");
    })
    .catch( err => {
      console.log(err);
    });
})

app.get("/:valu", function(req,res){
  const customListName = req.params.valu;

  List.findOne({name: customListName})
  .then( docs => {
    console.log(docs);
      if(!docs){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect(req.originalUrl);

      } else {
        res.render("list", {listTitle: docs.name, newListItems: docs.items})
      }
  }).catch(err => {
      console.log(err);
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
