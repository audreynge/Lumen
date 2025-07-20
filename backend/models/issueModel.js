import mongoose from 'mongoose';

const MBTALines = Object.freeze({
  RED_LINE: "Red Line",
  BLUE_LINE: "Blue Line",
  ORANGE_LINE: "Orange Line",
  GREEN_LINE: "Green Line",
  SILVER_LINE: "Silver Line",
})

const IssueSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: false },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  mbta_line: { type: String, enum: Object.values(MBTALines), required: false },
  photo_url: { type: String, required: false },
})

export default mongoose.model('Issue', IssueSchema);