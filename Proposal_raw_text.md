

Visualization of Uncertainty in Stocks, Mutual Funds, and ETFs Using Circular Tree Maps
Michael Sawchuk and Cole Sawyer
Professor Matthew Berger


Background and Motivation
Visualization of financial services allow lay users to better understand their investments and the consequences of investing in different types of securities. As computer science and data visualization students interested in the applications and consequences of these fields in the financial sector, we decided to combine these two fields in our project to gain a greater understanding of all fields involved. We originally gained an understanding of treemaps in class, but are building on the techniques shown in class with Gortler et al.’s Bubble Treemaps for Uncertainty Visualization. (http://graphics.uni-konstanz.de/publikationen/Goertler2018BubbleTreemapsUncertainty/bubble-treemaps.pdf)

Objectives
By completing this project, we hope to gain a greater understanding of the consequences of different investments as well as visualization of uncertainty in the context of securities. Along with visualizing aggregates for types of securities, we hope to show the volatility and uncertainty of different types of each security(e.g. Currency, commodity and real estate ETFs), as well as uncertainty for specific funds. In addition, we hope to gain a greater understanding of how treemaps can better visualize these securities. 

Data
For our data, we will be looking at the historical prices of the different securities that we are analyzing in order to derive the uncertainty and then visualize it. To start, we have found several different potential data sources that we may use, and the csv files that we have sampled from them will be found in the github. One example of a reliable source that we have found thus far is the St Louis Fed’s online historical price data sources that are available for download.

Data Processing
In order to process our data, we need to identify the type of each security, calculate standard deviation of each security, and then aggregate data. The bulk of this work will be done in identifying the type of security, while the other parts will be relatively trivial. 

Must-Have Features
Our project must have the following features in order to be viable:
1.	Calculate uncertainty through volatility metrics
2.	Represent market caps  through size (may need to be adjusted for currencies and commodities)
3.	Represent uncertainty through some channel (blur, padding size, or contour)

Optional Features
It would be great if we could add the following features to our project, but the project would still be viable without these:
1.	Add interactivity to show tickers and numerical uncertainty values
2.	Add interactivity to show different types of treemaps and ways of visualizing uncertainty (could be very difficult)
3.	Map color to overall performance (saturation) and security type (hue)

Project Schedule:
11/14: have data prepared in a ready-to use manner
End of Thanksgiving break:have uncertainty functions and have data aggregated and ready to visualize and have a  basic static circular treemap that visualizes uncertainty
11/28: add mouseover interactivity showing ticker and volatility
12/7: finish loose ends and finalize project

Visualization Technique:
http://graphics.uni-konstanz.de/publikationen/Goertler2018BubbleTreemapsUncertainty/bubble-treemaps.pdf
In order to implement this technique, we will need to have a solid understanding of how treemaps works in order to create a circular treemap, which we can then further refine into a bubble treemap that shows uncertainty. We will go about this step by step, first processing our data so that it provides data in a proper format and includes uncertainty, then creating a treemap for our data, then making it a bubble treemap, and finally implementing the uncertainty. The bubble treemap will be implemented using a force-directed recursive algorithm. Then, once that is set up, we will alter the borders of the circles by adding deformations in a wave-like pattern which scale up with the uncertainty of the data.

Analysis:
Once we have all of that prepared, we will be able to analyze the technique and determine how effective we believe it to be. We will do this by creating visualizations of our data and seeing how accurately we can estimate and compare uncertainties with the uncertainty aspect of this, and then testing to see how effectively it functions as a traditional tree map as well. We may compare the uncertainty bubble treemap to a traditional treemap for the same set of data.
"# DataVisFinalProject" 
