import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connect to mongodb database ${conn.connection.host}`.bgMagenta.white)
    }catch(error){
        console.log(`The following error was found on mongoDb${error}`.bgRed.white)
    }
}

export default connectDB;