import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            requred: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        veiws: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean
        }
    },
    { timestamps: true })

    //HOOK help us to Aggregation pipeline
videoSchema.plugin(mongooseAggregatePaginate)

export const Vedio = model("Vedio", videoSchema);