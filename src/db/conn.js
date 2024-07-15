const mongoose= require("mongoose")
mongoose.connect("mongodb+srv://eshalal9693:AlbyU3ixIjPbA3r1@summersafe.fmsgu57.mongodb.net/summersafe?retryWrites=true&w=majority&appName=summersafe",{
    
}).then(()=>{
    console.log(`connection successful`);
}).catch((e)=>{
    console.log(`no connection happend`);
})