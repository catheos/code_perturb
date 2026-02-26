import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    const questions = [
        "Q1: Generate html code showing a multi-line chart showing the total population trends from 2015-2022 for each region, then calculate and display the exact year-over-year growth per ragion, the absolute population change between the years, and the region with the highesr cumulative growth.",
        "Q2: Generate html code showing a stacked bar chart comparing the urban vs rural population distribution for the year 2022. Find the urbanisation rate percentage for each region, region ranks from highest to lowest based on urbanisation, and identify regions where rural populations exceed urban populations.",
        "Q3: Generate html code showing a duel-line time series chart comparing the overall unemployment rate and youth unemployment rate from 2018 to 2023. Display the peak quarter for each metric, the average annual unemployment rate, and identify any quarters where youth unemployment exceeded overall unemployment rate by more than 5 percentage points.",
        "Q4: Generate html code showing a grouped bar chart comparing male to famale unemployment rates for each year. Display the gender unemployment gap, determine which year had the largest gap, and display the overall mean gap across the entire period."
    ]
    res.json(questions);
});

module.exports = router;