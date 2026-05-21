/**
 * Generates 500 SEO articles about 1-800-GOT-JUNK? using Groq + Cerebras fallback.
 * Run: npx tsx scripts/generate-articles.ts (keys loaded from .env.local)
 */

import Groq from "groq-sdk";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import fs from "fs";
import path from "path";

let useGroq = true; // flips to false when Groq quota exhausted

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";

const ARTICLE_TOPICS = [
  // Core reviews & pricing
  "1-800-GOT-JUNK Review: Is It Worth the Price?",
  "1-800-GOT-JUNK Pricing: How Much Does It Cost?",
  "1-800-GOT-JUNK Cost Breakdown: What to Expect",
  "Is 1-800-GOT-JUNK Expensive? Honest Price Analysis",
  "1-800-GOT-JUNK vs Hiring a Dumpster: Which Is Cheaper?",
  "1-800-GOT-JUNK vs LoadUp: Which Is Better?",
  "1-800-GOT-JUNK vs Junk King: Full Comparison",
  "1-800-GOT-JUNK vs College Hunks: Who Wins?",
  "1-800-GOT-JUNK vs Two Men and a Truck: Comparison",
  "1-800-GOT-JUNK vs Local Junk Removal: Pros and Cons",
  "1-800-GOT-JUNK Alternatives: Best Options",
  "1-800-GOT-JUNK Reviews: What Customers Say",
  "1-800-GOT-JUNK Yelp Reviews: Are They Legit?",
  "1-800-GOT-JUNK Reddit Reviews: What People Think",
  "Is 1-800-GOT-JUNK Legit? Full Investigation",
  "1-800-GOT-JUNK Better Business Bureau Rating Explained",
  "1-800-GOT-JUNK Pros and Cons: Honest Assessment",
  "1-800-GOT-JUNK Same Day Service: How It Works",
  "How to Get a Discount on 1-800-GOT-JUNK",
  "1-800-GOT-JUNK Coupon Codes: Do They Exist?",

  // What they take
  "What Does 1-800-GOT-JUNK Take? Complete List",
  "What Will 1-800-GOT-JUNK NOT Take?",
  "Does 1-800-GOT-JUNK Take Mattresses?",
  "Does 1-800-GOT-JUNK Take Electronics?",
  "Does 1-800-GOT-JUNK Take Appliances?",
  "Does 1-800-GOT-JUNK Take Furniture?",
  "Does 1-800-GOT-JUNK Take Hazardous Waste?",
  "Does 1-800-GOT-JUNK Take Paint?",
  "Does 1-800-GOT-JUNK Take Tires?",
  "Does 1-800-GOT-JUNK Take Refrigerators?",
  "Does 1-800-GOT-JUNK Take Hot Tubs?",
  "Does 1-800-GOT-JUNK Take Pianos?",
  "Does 1-800-GOT-JUNK Take Yard Waste?",
  "Does 1-800-GOT-JUNK Take Construction Debris?",
  "Does 1-800-GOT-JUNK Take Old TVs?",
  "Does 1-800-GOT-JUNK Take Clothes and Donations?",
  "Does 1-800-GOT-JUNK Take Concrete?",
  "Does 1-800-GOT-JUNK Take Shed Debris?",
  "Does 1-800-GOT-JUNK Take Medical Equipment?",
  "Does 1-800-GOT-JUNK Take Exercise Equipment?",

  // Use cases
  "1-800-GOT-JUNK for Moving: What You Need to Know",
  "1-800-GOT-JUNK for Estate Cleanouts: Complete Guide",
  "1-800-GOT-JUNK for Hoarding Cleanouts",
  "1-800-GOT-JUNK for Home Renovation Cleanup",
  "1-800-GOT-JUNK for Garage Cleanouts",
  "1-800-GOT-JUNK for Basement Cleanouts",
  "1-800-GOT-JUNK for Attic Cleanouts",
  "1-800-GOT-JUNK for Office Cleanouts",
  "1-800-GOT-JUNK for Foreclosure Cleanouts",
  "1-800-GOT-JUNK for Rental Property Cleanouts",
  "1-800-GOT-JUNK for Storage Unit Cleanouts",
  "1-800-GOT-JUNK for Deck and Fence Removal",
  "1-800-GOT-JUNK for Shed Removal",
  "1-800-GOT-JUNK for Hot Tub Removal",
  "1-800-GOT-JUNK for Pool Removal",
  "1-800-GOT-JUNK for Old Furniture Removal",
  "1-800-GOT-JUNK for Appliance Removal",
  "1-800-GOT-JUNK for Electronics Recycling",
  "1-800-GOT-JUNK for Spring Cleaning",
  "1-800-GOT-JUNK for Post-Party Cleanup",

  // How it works
  "How Does 1-800-GOT-JUNK Work? Step by Step",
  "How to Book 1-800-GOT-JUNK Online",
  "What to Expect on 1-800-GOT-JUNK Appointment Day",
  "How 1-800-GOT-JUNK Calculates Price",
  "1-800-GOT-JUNK Truck Sizes: Which One Do You Need?",
  "1-800-GOT-JUNK Minimum Load: What Is It?",
  "1-800-GOT-JUNK Full Truck Load: What Fits?",
  "Does 1-800-GOT-JUNK Give Upfront Pricing?",
  "How to Prepare for 1-800-GOT-JUNK Pickup",
  "Can You Negotiate 1-800-GOT-JUNK Prices?",
  "1-800-GOT-JUNK Payment Methods: What They Accept",
  "Does 1-800-GOT-JUNK Recycle?",
  "What Does 1-800-GOT-JUNK Do With Your Junk?",
  "1-800-GOT-JUNK Donation Policy: What Gets Donated?",
  "How 1-800-GOT-JUNK Is Eco-Friendly",
  "1-800-GOT-JUNK vs DIY Junk Removal: What's Better?",
  "Is 1-800-GOT-JUNK Insured?",
  "Does 1-800-GOT-JUNK Do Heavy Lifting?",
  "Can 1-800-GOT-JUNK Access Tight Spaces?",
  "Does 1-800-GOT-JUNK Disassemble Furniture?",

  // Location specific (generic)
  "1-800-GOT-JUNK Near Me: How to Find a Location",
  "1-800-GOT-JUNK Service Areas: Full List",
  "1-800-GOT-JUNK in New York City",
  "1-800-GOT-JUNK in Los Angeles",
  "1-800-GOT-JUNK in Chicago",
  "1-800-GOT-JUNK in Houston",
  "1-800-GOT-JUNK in Phoenix",
  "1-800-GOT-JUNK in Philadelphia",
  "1-800-GOT-JUNK in San Antonio",
  "1-800-GOT-JUNK in Dallas",
  "1-800-GOT-JUNK in San Diego",
  "1-800-GOT-JUNK in San Jose",
  "1-800-GOT-JUNK in Austin",
  "1-800-GOT-JUNK in Jacksonville",
  "1-800-GOT-JUNK in Seattle",
  "1-800-GOT-JUNK in Denver",
  "1-800-GOT-JUNK in Boston",
  "1-800-GOT-JUNK in Nashville",
  "1-800-GOT-JUNK in Miami",
  "1-800-GOT-JUNK in Atlanta",

  // Decluttering guides
  "How to Declutter Your Home Before Calling 1-800-GOT-JUNK",
  "What to Keep vs Throw Away When Decluttering",
  "How to Declutter a Garage in One Weekend",
  "How to Declutter a Basement Step by Step",
  "How to Declutter an Attic Without Losing Your Mind",
  "How to Declutter After a Divorce",
  "How to Declutter After a Death in the Family",
  "How to Declutter Before Moving",
  "How to Declutter a Hoarder's Home",
  "How to Declutter When You're Overwhelmed",
  "Best Decluttering Methods That Actually Work",
  "The KonMari Method: Does It Work for Junk Removal?",
  "How to Donate vs Dump: Making the Right Choice",
  "Decluttering vs Minimalism: What's the Difference?",
  "How Often Should You Declutter Your Home?",
  "Room by Room Decluttering Guide",
  "How to Declutter Sentimental Items",
  "How to Get Kids to Help Declutter",
  "Decluttering Tips for Seniors",
  "How to Declutter When You Have No Time",

  // Junk removal tips
  "How to Save Money on Junk Removal",
  "Best Time to Hire Junk Removal Services",
  "How to Prepare for Junk Removal Day",
  "Things Junk Removal Won't Take: What to Do Instead",
  "Free Junk Removal Options Near You",
  "How to Dispose of Old Furniture for Free",
  "How to Get Rid of Old Appliances",
  "How to Dispose of Old Electronics Responsibly",
  "How to Get Rid of a Mattress",
  "How to Get Rid of Old Tires",
  "How to Dispose of Old Paint",
  "How to Dispose of Hazardous Household Waste",
  "How to Get Rid of Large Items Without a Truck",
  "Junk Removal vs Dumpster Rental: Which to Choose?",
  "How to Choose a Junk Removal Company",
  "Red Flags When Hiring Junk Removal Services",
  "Questions to Ask Before Hiring Junk Removal",
  "How to Read Junk Removal Quotes",
  "DIY Junk Removal Tips to Save Money",
  "When Is It Worth Hiring Professionals for Junk Removal?",

  // Specific item removal guides
  "How to Get Rid of Old Sofas and Couches",
  "How to Dispose of a Refrigerator",
  "How to Get Rid of an Old Washing Machine",
  "How to Dispose of an Old Dryer",
  "How to Get Rid of a Broken Dishwasher",
  "How to Dispose of Old Computers and Laptops",
  "How to Get Rid of Old TVs",
  "How to Dispose of Old Cell Phones",
  "How to Get Rid of Broken Exercise Equipment",
  "How to Dispose of Old Bicycles",
  "How to Get Rid of Old Carpets and Rugs",
  "How to Dispose of Old Windows and Doors",
  "How to Get Rid of Old Cabinets",
  "How to Dispose of Old Bookshelves",
  "How to Get Rid of Old Desks and Office Furniture",
  "How to Dispose of Old Grills and BBQs",
  "How to Get Rid of Old Lawn Mowers",
  "How to Dispose of Old Water Heaters",
  "How to Get Rid of Broken Trampolines",
  "How to Dispose of Old Swing Sets",

  // Real estate and property
  "Junk Removal for Real Estate Agents: Complete Guide",
  "How to Clean Out a Property Before Selling",
  "Estate Sale vs Junk Removal: Which First?",
  "How to Handle a Hoarder House Before Selling",
  "Junk Removal for Landlords: Tenant Cleanouts",
  "How to Clean Out a Rental Property Fast",
  "Foreclosure Cleanout Services: What to Know",
  "How to Handle Abandoned Property Cleanout",
  "Junk Removal for Property Flippers",
  "How to Stage a Home After Junk Removal",
  "Clearing Junk Increases Home Value: How Much?",
  "How to Prepare an Estate for Sale",
  "Probate Cleanouts: A Step-by-Step Guide",
  "How to Hire Help for Estate Cleanouts",
  "Commercial Property Cleanouts: What to Know",
  "Office Furniture Removal Services",
  "Restaurant Equipment Removal Guide",
  "Retail Store Cleanout Services",
  "Warehouse Cleanout: How to Handle Large Volumes",
  "How to Handle Construction Site Cleanup",

  // Seasonal and situational
  "Spring Cleaning with 1-800-GOT-JUNK",
  "Fall Decluttering: How to Prepare Your Home",
  "How to Clean Out After the Holidays",
  "Post-Renovation Cleanup: What to Do with Debris",
  "How to Clean Out a Home After a Natural Disaster",
  "Storm Debris Removal: What You Need to Know",
  "Flood Damage Cleanup and Junk Removal",
  "Fire Damage Cleanup: Removing Debris Safely",
  "How to Handle Junk After a Major Life Event",
  "Downsizing Your Home: A Junk Removal Guide",
  "Empty Nesters Guide to Decluttering",
  "Retirement Downsizing: How to Let Go of Stuff",
  "Moving to a Smaller Home: What to Toss",
  "How to Declutter Before a Big Move",
  "Last-Minute Moving Cleanout Tips",
  "How to Deal with a Deceased Parent's Belongings",
  "Grief and Decluttering: Taking It Step by Step",
  "How to Handle Junk When a Roommate Moves Out",
  "Divorce Cleanout: How to Fairly Divide and Remove",
  "How to Handle Clutter After a Breakup",

  // Comparisons with other disposal methods
  "Junk Removal vs Dumpster Rental: Full Comparison",
  "Junk Removal vs Selling on Facebook Marketplace",
  "Junk Removal vs Goodwill Donation",
  "Junk Removal vs Habitat for Humanity ReStore",
  "Junk Removal vs Curbside Bulk Pickup",
  "Junk Removal vs Municipal Waste Facility",
  "Junk Removal vs Selling at a Garage Sale",
  "Junk Removal vs Hiring Day Laborers",
  "Full-Service vs Self-Serve Junk Removal",
  "Is Junk Removal Tax Deductible?",

  // Business and commercial
  "Commercial Junk Removal: What Businesses Need to Know",
  "Office Cleanout Services: How to Plan One",
  "How to Handle Electronic Waste for Businesses",
  "Retail Store Closeout Junk Removal",
  "Restaurant Closing Cleanout Guide",
  "Medical Office Cleanout: Special Considerations",
  "How to Handle Confidential Document Disposal",
  "Gym Equipment Removal for Businesses",
  "Hotel Renovation Junk Removal",
  "School and University Cleanout Services",

  // Sustainability and recycling
  "How 1-800-GOT-JUNK Handles Recycling",
  "What Happens to Your Junk After Removal?",
  "How to Dispose of E-Waste Responsibly",
  "Eco-Friendly Junk Removal Options",
  "How to Donate Usable Items Instead of Trashing Them",
  "Best Charities That Accept Furniture Donations",
  "Best Charities That Pick Up Your Donations",
  "How to Recycle Old Appliances",
  "How to Reduce Junk Before It Accumulates",
  "Zero Waste Home Cleanout: Is It Possible?",

  // GSC-targeted: LoadUp (highest impression competitor)
  "LoadUp Junk Removal Review: Pros, Cons and Pricing",
  "LoadUp vs 1-800-GOT-JUNK: Which Is Better?",
  "LoadUp Junk Removal Prices: What to Expect",
  "LoadUp Junk Removal Reviews: What Customers Say",
  "Is LoadUp Junk Removal Legit?",
  "LoadUp Junk Removal vs Junk King: Full Comparison",
  "LoadUp Junk Removal Appliance Removal: How It Works",
  "LoadUp Junk Removal for Large Items: What You Need to Know",
  "LoadUp Junk Removal Ratings: Are They Worth It?",
  "LoadUp Junk Removal Complaints: What Users Report",
  "LoadUp vs College Hunks: Which Junk Service Is Better?",
  "LoadUp Eco-Friendly Junk Removal: What They Recycle",
  "LoadUp Junk Removal Same Day Service: Is It Available?",
  "LoadUp Junk Removal Coupon Codes and Discounts",
  "How LoadUp Junk Removal Works: Step by Step",

  // GSC-targeted: Pricing (positions 50-80, needs better content)
  "1-800-GOT-JUNK Pricing Guide: Exact Costs Explained",
  "How Much Does 1-800-GOT-JUNK Charge Per Item?",
  "1-800-GOT-JUNK Price List: What Everything Costs",
  "1-800-GOT-JUNK Hidden Fees: What to Watch Out For",
  "1-800-GOT-JUNK Minimum Price: What Is the Cheapest Load?",
  "Average Cost of 1-800-GOT-JUNK: Real Customer Prices",
  "Is 1-800-GOT-JUNK Free? What the Free Quote Means",
  "1-800-GOT-JUNK Volume-Based Pricing Explained",
  "How to Get the Cheapest 1-800-GOT-JUNK Quote",
  "1-800-GOT-JUNK Upfront Pricing: No Surprises Guide",
  "1-800-GOT-JUNK vs Dumpster Rental: True Cost Comparison",
  "1-800-GOT-JUNK Estimate Process: What Happens on Arrival",
  "Why Is 1-800-GOT-JUNK So Expensive? Honest Answer",
  "1-800-GOT-JUNK Rates by City: Why Prices Vary",
  "1-800-GOT-JUNK Pricing for Appliances: What to Expect",
  "1-800-GOT-JUNK Pricing for Furniture Removal",
  "1-800-GOT-JUNK Full Truck Load Price: Is It Worth It?",
  "1-800-GOT-JUNK Half Load vs Full Load: Which Is Better Value?",
  "1-800-GOT-JUNK Pricing for Estate Cleanouts",
  "1-800-GOT-JUNK Pricing for Garage Cleanouts",

  // GSC-targeted: Discounts/Promo (lots of queries)
  "1-800-GOT-JUNK Promo Code: Do They Actually Work?",
  "1-800-GOT-JUNK Coupon: How to Get a Discount",
  "1-800-GOT-JUNK Deals: Best Ways to Save Money",
  "1-800-GOT-JUNK Discount for Seniors",
  "1-800-GOT-JUNK Military Discount",
  "1-800-GOT-JUNK AAA Discount: Is There One?",
  "How to Negotiate a Lower Price with 1-800-GOT-JUNK",
  "1-800-GOT-JUNK First-Time Customer Discount",
  "1-800-GOT-JUNK Referral Program: How It Works",
  "Best Times to Book 1-800-GOT-JUNK for Lower Prices",

  // GSC-targeted: E-waste/recycling (low comp, specific queries)
  "1-800-GOT-JUNK E-Waste Policy: What Happens to Electronics",
  "Does 1-800-GOT-JUNK Recycle Electronics?",
  "1-800-GOT-JUNK Appliance Recycling: Where Does It Go?",
  "1-800-GOT-JUNK Sustainability: How Eco-Friendly Are They?",
  "Does 1-800-GOT-JUNK Sort Items for Reuse and Donation?",
  "1-800-GOT-JUNK Recycling Policy: Full Breakdown",
  "What Happens to Your Junk After 1-800-GOT-JUNK Picks It Up?",
  "Does 1-800-GOT-JUNK Take TVs and Recycle Them?",
  "1-800-GOT-JUNK Hazardous Materials Policy",
  "1-800-GOT-JUNK E-Waste Hazardous Waste: What They Won't Take",
  "1-800-GOT-JUNK Electronics Recycling: TVs, Computers, Phones",
  "1-800-GOT-JUNK Donation Policy: What Gets Donated vs Trashed",
  "How 1-800-GOT-JUNK Decides What to Recycle",
  "1-800-GOT-JUNK Green Initiatives Explained",
  "Responsible E-Waste Disposal: Best Options",

  // GSC-targeted: "Does it take X" (position 8-14, near page 1)
  "Does 1-800-GOT-JUNK Take Stoves and Ovens?",
  "Does 1-800-GOT-JUNK Take Free Items?",
  "Does 1-800-GOT-JUNK Pick Up for Free?",
  "Does 1-800-GOT-JUNK Take Junk Cars?",
  "Does 1-800-GOT-JUNK Take Carpets and Rugs?",
  "Does 1-800-GOT-JUNK Take Drywall?",
  "Does 1-800-GOT-JUNK Take Old Insulation?",
  "Does 1-800-GOT-JUNK Take Pianos and Heavy Items?",
  "Does 1-800-GOT-JUNK Take Propane Tanks?",
  "Does 1-800-GOT-JUNK Take Asbestos?",
  "Does 1-800-GOT-JUNK Take Batteries?",
  "Does 1-800-GOT-JUNK Take Fluorescent Lights?",
  "Does 1-800-GOT-JUNK Take Dirt and Gravel?",
  "Does 1-800-GOT-JUNK Take Garage Doors?",
  "Does 1-800-GOT-JUNK Take Metal Scrap?",
  "Does 1-800-GOT-JUNK Take Swing Sets?",
  "Does 1-800-GOT-JUNK Take Trampolines?",
  "Does 1-800-GOT-JUNK Take Pool Tables?",
  "Does 1-800-GOT-JUNK Take Gym Equipment?",
  "Does 1-800-GOT-JUNK Take Safes?",

  // GSC-targeted: How it works queries
  "How Does 1-800-GOT-JUNK Work? Complete Walkthrough",
  "How Does 1800GotJunk Calculate Price?",
  "What to Expect When 1-800-GOT-JUNK Arrives",
  "How Long Does 1-800-GOT-JUNK Take to Remove Junk?",
  "1-800-GOT-JUNK Process: From Booking to Cleanup",
  "How to Book 1-800-GOT-JUNK: Step-by-Step",
  "Can You Watch 1-800-GOT-JUNK Load the Truck?",
  "Does 1-800-GOT-JUNK Require You to Be Home?",
  "1-800-GOT-JUNK After Hours: Can They Come Late?",
  "1-800-GOT-JUNK Weekend Availability",

  // More competitor comparisons
  "Junk King vs 1-800-GOT-JUNK: Detailed Comparison",
  "College Hunks Hauling Junk Review",
  "College Hunks vs 1-800-GOT-JUNK: Which Is Cheaper?",
  "Junkluggers vs 1-800-GOT-JUNK: Eco-Friendly Showdown",
  "1-800-GOT-JUNK vs Habitat for Humanity ReStore",
  "1-800-GOT-JUNK vs Craigslist Free Section",
  "1-800-GOT-JUNK vs Facebook Marketplace",
  "1-800-GOT-JUNK vs Salvation Army Pickup",
  "Best Junk Removal Companies: Full Ranking",
  "Cheapest Junk Removal Near Me: How to Find It",
  "1-800-GOT-JUNK vs Local Independent Haulers",
  "Trash Gators vs 1-800-GOT-JUNK",
  "1-800-GOT-JUNK vs Hired Truck: Which Saves More?",
  "1-800-GOT-JUNK vs GoJunk Prices",
  "1-800-GOT-JUNK vs Waste Management",

  // Location-specific (Denver ranking, others to add)
  "1-800-GOT-JUNK in Denver: Pricing and Service Review",
  "1-800-GOT-JUNK in Colorado: What to Know",
  "1-800-GOT-JUNK in Las Vegas",
  "1-800-GOT-JUNK in Portland",
  "1-800-GOT-JUNK in Minneapolis",
  "1-800-GOT-JUNK in Detroit",
  "1-800-GOT-JUNK in Tampa",
  "1-800-GOT-JUNK in Orlando",
  "1-800-GOT-JUNK in Charlotte",
  "1-800-GOT-JUNK in Pittsburgh",
  "1-800-GOT-JUNK in St Louis",
  "1-800-GOT-JUNK in Kansas City",
  "1-800-GOT-JUNK in Salt Lake City",
  "1-800-GOT-JUNK in Sacramento",
  "1-800-GOT-JUNK in Indianapolis",
  "1-800-GOT-JUNK in Columbus Ohio",
  "1-800-GOT-JUNK in Baltimore",
  "1-800-GOT-JUNK in Raleigh",
  "1-800-GOT-JUNK in Richmond Virginia",
  "1-800-GOT-JUNK in Oklahoma City",

  // More "how to get rid of X" (proven format)
  "How to Get Rid of an Old Sofa for Free",
  "How to Get Rid of Old Appliances for Free",
  "How to Dispose of a Broken Refrigerator",
  "How to Get Rid of Old Carpet for Free",
  "How to Dispose of Old Windows",
  "How to Get Rid of Old Shed",
  "How to Dispose of Old Fence",
  "How to Get Rid of Old Decking",
  "How to Dispose of a Broken Hot Tub",
  "How to Get Rid of Old Swing Set for Free",
  "How to Dispose of Old Drywall",
  "How to Get Rid of Old Water Heater",
  "How to Dispose of Old HVAC System",
  "How to Get Rid of Old Generator",
  "How to Dispose of Old Satellite Dish",
  "How to Get Rid of Old Spa and Jacuzzi",
  "How to Dispose of Old Ceiling Fan",
  "How to Get Rid of Old Light Fixtures",
  "How to Dispose of Old Doors and Windows",
  "How to Get Rid of Old Garage Door",

  // Specific removal guides
  "1-800-GOT-JUNK for Post-Demolition Cleanup",
  "1-800-GOT-JUNK for Renovation Debris Removal",
  "1-800-GOT-JUNK for Bathroom Renovation Cleanup",
  "1-800-GOT-JUNK for Kitchen Renovation Debris",
  "1-800-GOT-JUNK for Roof Debris Removal",
  "1-800-GOT-JUNK for Landscaping Waste Removal",
  "1-800-GOT-JUNK for Tree Removal Debris",
  "1-800-GOT-JUNK for Pool Demolition Cleanup",
  "1-800-GOT-JUNK for Deck Demolition Debris",
  "1-800-GOT-JUNK for Fence Removal Debris",
  "1-800-GOT-JUNK for Basement Renovation Cleanup",
  "1-800-GOT-JUNK for Garage Conversion Cleanup",
  "1-800-GOT-JUNK for Home Addition Debris",
  "1-800-GOT-JUNK for Flooring Removal Debris",
  "1-800-GOT-JUNK for Tile Removal Cleanup",

  // Trust/review signals (ranking 35-50)
  "1-800-GOT-JUNK Trustpilot Reviews: Are They Real?",
  "1-800-GOT-JUNK Google Reviews: What They Really Say",
  "1-800-GOT-JUNK Complaints: Common Issues and Fixes",
  "1-800-GOT-JUNK Customer Service: How to Get Help",
  "Is 1-800-GOT-JUNK Worth It? Real Customer Verdict",
  "1-800-GOT-JUNK Before and After: Real Cleanout Results",
  "1-800-GOT-JUNK for Seniors: Special Considerations",
  "1-800-GOT-JUNK Accessibility: Can They Handle Any Space?",
  "1-800-GOT-JUNK Insurance: What Are You Protected Against?",
  "1-800-GOT-JUNK Background Checks: Are Crews Vetted?",

  // DIY and budget

  "How to Rent a Dumpster: Step-by-Step Guide",
  "Bagster vs Dumpster vs Junk Removal: Which to Choose?",
  "How to Haul Junk Yourself and Save Money",
  "Renting a Pickup Truck for Junk Removal",
  "Free Ways to Get Rid of Unwanted Stuff",
  "Apps to Sell Old Furniture and Junk Online",
  "Facebook Marketplace Tips for Getting Rid of Stuff",
  "Craigslist Free Section: How to Use It",
  "How to Host a Successful Garage Sale",
  "Estate Sale Companies: Are They Worth It?",

  // Health and safety
  "Junk Removal and Mold: What You Should Know",
  "Asbestos in Old Junk: What to Do",
  "Lead Paint Disposal: Safety Guide",
  "How to Safely Remove Old Insulation",
  "Chemical Disposal Safety Tips",
  "Biohazard Cleanout: When to Call Professionals",
  "How to Safely Dispose of Old Medications",
  "Sharp Object Disposal Safety Guide",
  "Heavy Item Safety: Preventing Injury During Cleanup",
  "When to Hire Professionals vs DIY Junk Removal",

  // Emotional and lifestyle
  "The Psychology of Clutter: Why We Keep Stuff",
  "How Decluttering Improves Mental Health",
  "The Benefits of a Clean Home",
  "How Clutter Affects Your Sleep",
  "How to Stop Accumulating Junk",
  "Minimalism vs Decluttering: Key Differences",
  "How to Teach Kids to Declutter",
  "Decluttering as Self-Care",
  "The Emotional Difficulty of Getting Rid of Stuff",
  "How to Feel Good About Throwing Things Away",

  // FAQ-style articles
  "Is Junk Removal Worth the Cost?",
  "How Long Does Junk Removal Take?",
  "Do I Need to Be Home for Junk Removal?",
  "Can Junk Removal Companies Take Everything at Once?",
  "What Happens if Junk Removal Damages My Property?",
  "Do Junk Removal Companies Give Free Estimates?",
  "How Far in Advance Should I Book Junk Removal?",
  "Is Junk Removal Available on Weekends?",
  "Can I Schedule Recurring Junk Removal?",
  "What Is the Heaviest Item Junk Removal Will Take?",
  "Does Junk Removal Include Labor?",
  "Will Junk Removal Go Into My Home?",
  "Can Junk Removal Help with Entire House Cleanouts?",
  "Do Junk Removal Companies Separate Recyclables?",
  "What Do I Do If I'm Not Satisfied with Junk Removal?",
  "How Do I Complain About a Junk Removal Company?",
  "Are Junk Removal Companies Licensed?",
  "Do Junk Removal Companies Need Insurance?",
  "What Is Junk Removal Liability?",
  "How Do I Leave a Review for 1-800-GOT-JUNK?",

  // Trending and informational
  "The Junk Removal Industry: How Big Is It?",
  "History of 1-800-GOT-JUNK",
  "Who Founded 1-800-GOT-JUNK?",
  "1-800-GOT-JUNK Franchise: How It Works",
  "How Much Does a 1-800-GOT-JUNK Franchise Cost?",
  "1-800-GOT-JUNK Revenue: How Big Is the Company?",
  "1-800-GOT-JUNK Truck: Inside Look",
  "1-800-GOT-JUNK Uniforms: Why They Matter",
  "1-800-GOT-JUNK Marketing: How They Built a Brand",
  "Future of Junk Removal: Where the Industry Is Headed",

  // More comparisons
  "Junk King Review: Is It Better Than 1-800-GOT-JUNK?",
  "LoadUp Review: How Does It Compare?",
  "College Hunks Review: Worth the Price?",
  "Junkluggers Review: Eco-Friendly Alternative?",
  "Trash Gators Review",
  "1-800-GOT-JUNK vs Junkluggers: Which Is Greener?",
  "1-800-GOT-JUNK vs Trash Gators: Comparison",
  "Best Junk Removal Companies Ranked",
  "Cheapest Junk Removal Services Compared",
  "Best Eco-Friendly Junk Removal Services",

  // More niche
  "How to Remove a Hot Tub Without a Crane",
  "Piano Removal: What You Need to Know",
  "Safe Removal: What to Do",
  "Boat Removal and Disposal Guide",
  "RV and Camper Disposal Options",
  "How to Get Rid of an Old Car",
  "Scrap Metal Removal and Recycling Guide",
  "How to Dispose of Old Lumber and Wood",
  "Brick and Concrete Disposal Guide",
  "Drywall Removal and Disposal",
  "Carpet Removal and Disposal Guide",
  "Tile Removal and Debris Disposal",
  "How to Dispose of Old Insulation Safely",
  "Basement Waterproofing Debris Removal",
  "How to Clean Out a Crawl Space",
  "Attic Insulation Removal Guide",
  "Chimney Cleanout and Debris Removal",
  "Gutters and Downspout Disposal",
  "Landscaping Debris Removal Guide",
  "Tree Stump and Branch Removal",

  // Bonus final stretch
  "How to Organize a Community Cleanup Event",
  "Neighborhood Junk Removal Programs",
  "Free Bulk Pickup Days: How to Find Them",
  "How to Request Bulk Pickup from Your City",
  "Municipality Junk Programs vs Private Services",
  "How to Appeal for Free Junk Removal Assistance",
  "Junk Removal for Low-Income Households",
  "Senior Junk Removal Discounts and Programs",
  "Veteran Junk Removal Discounts",
  "Student Discounts on Junk Removal Services",
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function generateArticle(groq: Groq, cerebras: Cerebras, topic: string, index: number): Promise<void> {
  const slug = slugify(topic);
  const outPath = path.join("content", "articles", `${slug}.json`);

  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    if (!existing.error) {
      console.log(`[${index + 1}/500] SKIP: ${topic}`);
      return;
    }
    fs.unlinkSync(outPath); // delete error file, retry
  }

  const prompt = `Write a comprehensive, SEO-optimized article titled "${topic}" for a website about 1-800-GOT-JUNK?, the junk removal service.

REQUIREMENTS:
- 800-1200 words
- Conversational but helpful tone
- Naturally mention "1-800-GOT-JUNK?" throughout
- Include H1, H2, H3 sections and short paragraphs
- Include at least 3 [CTA] placeholders where affiliate links go
- First line: META: <120-160 char meta description>
- Second line: KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5
- Write in HTML with proper h1, h2, h3, p, ul, li tags
- [CTA] placeholder text: "Get a Free Quote from 1-800-GOT-JUNK?" or "Book 1-800-GOT-JUNK Now"
- Do NOT include actual URLs — use [CTA] only
- Make content genuinely useful to someone searching this topic

Article title: ${topic}`;

  try {
    let content = "";

    if (useGroq) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.8,
        });
        content = completion.choices[0]?.message?.content ?? "";
      } catch (groqErr: unknown) {
        const msg = String(groqErr);
        if (msg.includes("429") || msg.includes("rate_limit") || msg.includes("tokens per day")) {
          console.log("Groq quota hit -- switching to Cerebras");
          useGroq = false;
        } else {
          throw groqErr;
        }
      }
    }

    if (!useGroq || !content) {
      const completion = await cerebras.chat.completions.create({
        model: "llama3.1-8b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        // @ts-ignore
        temperature: 0.8,
      });
      content = (completion.choices[0]?.message?.content as string) ?? "";
      if (!useGroq) console.log(`[${index + 1}/500] Cerebras: ${topic}`);
    }
    const metaMatch = content.match(/META:\s*(.+)/);
    const kwMatch = content.match(/KEYWORDS:\s*(.+)/);
    const metaDescription = metaMatch ? metaMatch[1].trim() : `Learn about ${topic} and how 1-800-GOT-JUNK? can help.`;
    const keywords = kwMatch ? kwMatch[1].split(",").map((k) => k.trim()) : ["1-800-GOT-JUNK", "junk removal", "junk pickup"];

    const body = content
      .replace(/META:\s*.+\n?/, "")
      .replace(/KEYWORDS:\s*.+\n?/, "")
      .replace(/\[CTA\]/g, `<a href="${AFFILIATE}" class="cta-link">Get a Free Quote from 1-800-GOT-JUNK? →</a>`);

    const article = { slug, title: topic, metaDescription, keywords, body, generatedAt: new Date().toISOString() };

    // Write without BOM using Buffer
    const json = JSON.stringify(article, null, 2);
    fs.writeFileSync(outPath, Buffer.from(json, "utf-8"));
    console.log(`[${index + 1}/500] DONE: ${topic}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${index + 1}/500] ERROR: ${topic} — ${msg}`);
    const errArticle = { slug, title: topic, metaDescription: "", keywords: [], body: "", generatedAt: new Date().toISOString(), error: msg };
    fs.writeFileSync(outPath, Buffer.from(JSON.stringify(errArticle, null, 2), "utf-8"));
  }

  await new Promise((r) => setTimeout(r, 13000));
}

async function main() {
  // Load keys from .env.local
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
      const [k, v] = line.split("=");
      if (k && v) process.env[k.trim()] = v.trim();
    });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;

  if (!groqKey && !cerebrasKey) { console.error("ERROR: Set GROQ_API_KEY and/or CEREBRAS_API_KEY in .env.local"); process.exit(1); }
  if (!groqKey) { useGroq = false; console.log("No Groq key -- using Cerebras only"); }
  if (!cerebrasKey) console.log("No Cerebras key -- Groq only, no fallback");

  const groq = new Groq({ apiKey: groqKey ?? "none" });
  const cerebras = new Cerebras({ apiKey: cerebrasKey ?? "none" });

  fs.mkdirSync(path.join("content", "articles"), { recursive: true });

  console.log(`Generating ${ARTICLE_TOPICS.length} articles (GSC-targeted)...`);
  for (let i = 0; i < ARTICLE_TOPICS.length; i++) {
    await generateArticle(groq, cerebras, ARTICLE_TOPICS[i], i);
  }
  console.log("Done! All articles generated.");
}

main().catch(console.error);
