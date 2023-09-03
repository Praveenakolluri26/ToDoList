//jshint esversion:6

//Username and Password : ToDoList

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://ToDoList:ToDoList@cluster0.i2bzmdt.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser: true});

let items =[];
let workItems=[];

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Exercise"
});

const item2 = new Item({
    name : "Read News"
});

const item3 = new Item({
    name : "Skin Care"
});

const defaultitems = [item1,item2,item3];

const ListSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",ListSchema);

app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        
        if(foundItems.length === 0){
            Item.insertMany(defaultitems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully inserted elements");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle : "Today", newListItems:foundItems});
        }
    });
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if(listName==="Today"){
        
    item.save();

    res.redirect("/");

    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
 
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Item Successfully Deleted.");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
        
    }

    
    

})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                    name : customListName,
                    items: defaultitems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                // Show existing list

                res.render("list",{listTitle : foundList.name, newListItems:foundList.items});
            }
        }
    })

    
});



app.listen(3000,function(){
    console.log("Server started on port 3000");
});