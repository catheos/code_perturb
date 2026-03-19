import express, { Request, Response } from "express";

const router = express.Router();

interface AIRequest {
    id: number;
    question: string;
    dataset: any; // Any until decision on CSV or conversion to JSON
}

router.get("/", (req: Request, res: Response) => {
    // TODO: will need to parse CSV or convert CSV to JSON in real dataset
    const dataset = require("../../data/dataset.example.json");

    // Questions with dataset
    const tasks: AIRequest[] = [
        {
            id: 1,
            question: "Generate html code showing a multi-line chart showing the total population trends from 2015-2022 for each region, then calculate and display the exact year-over-year growth per ragion, the absolute population change between the years, and the region with the highesr cumulative growth.",
            dataset
        },
        {
            id: 2,
            question: "Generate html code showing a stacked bar chart comparing the urban vs rural population distribution for the year 2022. Find the urbanisation rate percentage for each region, region ranks from highest to lowest based on urbanisation, and identify regions where rural populations exceed urban populations.",
            dataset
        },
        {
            id: 3,
            question: "Generate html code showing a duel-line time series chart comparing the overall unemployment rate and youth unemployment rate from 2018 to 2023. Display the peak quarter for each metric, the average annual unemployment rate, and identify any quarters where youth unemployment exceeded overall unemployment rate by more than 5 percentage points.",
            dataset
        },
        {
            id: 4,
            question: "Generate html code showing a grouped bar chart comparing male to famale unemployment rates for each year. Display the gender unemployment gap, determine which year had the largest gap, and display the overall mean gap across the entire period.",
            dataset
        }
    ]

    res.json(tasks);
});

module.exports = router;