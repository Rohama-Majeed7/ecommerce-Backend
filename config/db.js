import mongoose from "mongoose"

async function connectDB() {
    try {
       await mongoose.connect(process.env.MONGOO_URI)
    } catch (error) {
         console.log(error); 
    }
}

export default connectDB