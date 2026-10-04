import { STOCKS, type Stock } from "./stocks";

// Plain English, evergreen guides for the stocks we cover. They explain the business, never predict the price.
export type StockGuide = {
  symbol: string;
  group: "Big tech" | "Chips and AI" | "Consumer" | "Finance and payments" | "Energy and holdings";
  simple: string;
  makesMoney: string[];
  movesStock: string[];
};

export const STOCK_GUIDES: StockGuide[] = [
  {
    symbol: "AAPL", group: "Big tech",
    simple: "Apple makes the iPhone, Mac and iPad, and sells apps, music and storage to the people who own them. Think of it as a shop that sells you a favorite gadget and then keeps selling you things for it.",
    makesMoney: ["Selling iPhones, Macs, iPads and Apple Watches.", "Services such as the App Store, iCloud, Apple Music and Apple TV, which people pay for every month.", "Fees from other companies, for example for being the default search engine on its devices."],
    movesStock: ["How well each new iPhone sells.", "Growth of the services business, which earns higher profits than devices.", "Rules and court cases about App Store fees, and trade and tariff news."],
  },
  {
    symbol: "MSFT", group: "Big tech",
    simple: "Microsoft sells the software most offices run on, like Windows, Word and Excel, and rents out giant computers over the internet. Companies pay it a little every month for tools they use every day.",
    makesMoney: ["Azure, its cloud service that rents computing power to businesses.", "Microsoft 365 and Windows subscriptions and licenses.", "LinkedIn, Xbox gaming and business software like Dynamics."],
    movesStock: ["How fast Azure cloud sales are growing.", "Demand for its AI tools, including Copilot and its partnership with OpenAI.", "Spending on AI data centers, which is costly."],
  },
  {
    symbol: "NVDA", group: "Chips and AI",
    simple: "NVIDIA designs the powerful computer chips that train and run artificial intelligence. When companies race to build AI, NVIDIA sells them the engines.",
    makesMoney: ["Selling data center chips (GPUs) to cloud and AI companies.", "Gaming graphics cards for PCs.", "Chips for cars, robots and professional graphics."],
    movesStock: ["How much big tech companies plan to spend on AI hardware.", "New chip launches and whether supply can keep up.", "Competition from rivals and export rules on selling chips to China."],
  },
  {
    symbol: "AMZN", group: "Big tech",
    simple: "Amazon is an online store that delivers almost anything to your door, and it also rents out computers over the internet to other companies. The shop is big, but the computer rentals earn a lot of the profit.",
    makesMoney: ["Online shopping, including sales by outside sellers who pay Amazon fees.", "AWS, the cloud service used by many businesses.", "Advertising, Prime subscriptions and streaming."],
    movesStock: ["AWS growth and how much AI work customers bring to it.", "Shopping demand during holidays and sales events.", "Shipping costs and how efficient its warehouses are."],
  },
  {
    symbol: "GOOGL", group: "Big tech",
    simple: "Alphabet owns Google, YouTube and Android. Most of its money comes from ads shown next to the things people search for and watch.",
    makesMoney: ["Advertising on Google Search and YouTube.", "Google Cloud, which rents computing to businesses.", "Subscriptions, Android, hardware and long shot projects like Waymo."],
    movesStock: ["Whether AI changes how people search and how ads are sold.", "Ad spending across the economy, which rises and falls with business confidence.", "Antitrust cases and regulation."],
  },
  {
    symbol: "META", group: "Big tech",
    simple: "Meta runs Facebook, Instagram, WhatsApp and Threads. Billions of people use them for free, and Meta earns money by showing ads to those people.",
    makesMoney: ["Ads on Facebook, Instagram and other apps, which is nearly all of its revenue.", "Smaller sales of Quest headsets and smart glasses.", "Growing business messaging on WhatsApp."],
    movesStock: ["How many people use its apps and how much time they spend.", "Advertiser demand and the price of ads.", "Big spending on AI and the metaverse, plus privacy and child safety rules."],
  },
  {
    symbol: "TSLA", group: "Big tech",
    simple: "Tesla builds electric cars and sells batteries that store power for homes and the grid. It also works on self driving software and robots.",
    makesMoney: ["Selling electric vehicles.", "Energy storage products like Megapack and Powerwall.", "Software, charging and regulatory credits."],
    movesStock: ["How many cars it delivers each quarter and at what price.", "Progress on self driving and robotaxis.", "Competition from other carmakers, interest rates and government incentives for electric cars."],
  },
  {
    symbol: "AVGO", group: "Chips and AI",
    simple: "Broadcom makes the chips and software that move data around: inside phones, data centers and networks. It also builds custom AI chips for big tech companies.",
    makesMoney: ["Chips for networking, data centers and wireless devices.", "Custom AI chips designed for large cloud customers.", "Enterprise software such as VMware, sold by subscription."],
    movesStock: ["Demand for AI networking and custom chips.", "How well the VMware software business performs.", "Concentration, since a few huge customers are a large part of sales."],
  },
  {
    symbol: "NFLX", group: "Consumer",
    simple: "Netflix is a streaming service. You pay every month and watch shows and movies as much as you like, and it makes many of them itself.",
    makesMoney: ["Monthly subscriptions in more than 190 countries.", "Cheaper plans with ads, which bring in ad revenue.", "Extras such as paid sharing and live events."],
    movesStock: ["How many new subscribers it adds.", "Price changes and the success of big shows and films.", "Competition from other streaming services and how much it spends on content."],
  },
  {
    symbol: "COST", group: "Consumer",
    simple: "Costco is a warehouse store where you pay a yearly fee to shop. Prices are low and sizes are big, so people stay members and buy in bulk.",
    makesMoney: ["Membership fees, which are a big part of profit.", "Selling groceries, gas and household goods at thin margins.", "Its own Kirkland Signature brand."],
    movesStock: ["How many members join and renew.", "Sales at stores that were open a year ago.", "Consumer spending and whether it raises membership prices."],
  },
  {
    symbol: "AMD", group: "Chips and AI",
    simple: "AMD designs computer chips for PCs, game consoles and data centers, and it competes with Intel and NVIDIA. It is trying to win a share of the AI chip market.",
    makesMoney: ["Server and data center chips.", "Processors for laptops and desktops.", "Chips for game consoles and embedded devices."],
    movesStock: ["Whether its AI chips win customers away from NVIDIA.", "Share gains against Intel in PCs and servers.", "The PC market cycle and chip supply."],
  },
  {
    symbol: "ADBE", group: "Big tech",
    simple: "Adobe makes creative software like Photoshop, Illustrator and Acrobat (the PDF tool). Designers and businesses pay a subscription to keep using it.",
    makesMoney: ["Creative Cloud subscriptions for designers, video editors and artists.", "Document tools like Acrobat and PDF services.", "Marketing and analytics software for businesses."],
    movesStock: ["Whether AI tools help or threaten its products.", "How many people keep their subscriptions.", "Competition from newer design and AI image apps."],
  },
  {
    symbol: "JPM", group: "Finance and payments",
    simple: "JPMorgan Chase is the largest bank in the United States. It takes deposits, lends money, helps companies raise cash and runs the Chase credit cards.",
    makesMoney: ["Interest earned on loans, minus interest paid to savers.", "Fees from credit cards, advice, and trading for clients.", "Managing money for wealthy and institutional customers."],
    movesStock: ["Interest rates set by the Federal Reserve.", "How many borrowers fail to pay loans back.", "Economic growth and bank rules on how much cash must be held."],
  },
  {
    symbol: "V", group: "Finance and payments",
    simple: "Visa runs the network that moves money when you tap or swipe a card. It does not lend you money. It takes a tiny fee each time a payment goes through.",
    makesMoney: ["A small fee on each card payment processed.", "Fees on payments across borders and currencies.", "Services such as fraud protection and data."],
    movesStock: ["How much people spend by card.", "Travel and international spending.", "Rules on card fees and new payment methods that skip cards."],
  },
  {
    symbol: "WMT", group: "Consumer",
    simple: "Walmart is the world's biggest store chain. People shop there for everyday things like food and household items because prices are low.",
    makesMoney: ["Groceries and everyday goods sold in stores and online.", "Sam's Club membership stores.", "Growing extras such as advertising and its online marketplace."],
    movesStock: ["Spending by everyday shoppers, and whether higher earners shop there more.", "Grocery prices and costs for goods and shipping.", "Online and delivery growth."],
  },
  {
    symbol: "XOM", group: "Energy and holdings",
    simple: "Exxon Mobil digs up oil and natural gas and turns them into fuel and chemicals. When oil prices go up, it usually earns more.",
    makesMoney: ["Selling oil and natural gas it produces.", "Refining crude oil into gasoline and diesel.", "Making chemicals used in plastics and packaging."],
    movesStock: ["The price of oil and natural gas.", "How much it produces and what it costs to drill.", "Energy policy, and demand as the world shifts toward cleaner power."],
  },
  {
    symbol: "MA", group: "Finance and payments",
    simple: "Mastercard is a payment network like Visa. It connects shoppers, shops and banks and charges a tiny fee on each purchase.",
    makesMoney: ["Fees on card payments that go through its network.", "Fees on cross border payments.", "Data, security and other services sold to banks."],
    movesStock: ["Consumer spending and how many people pay by card.", "Travel spending.", "Regulation of card fees and new ways to pay."],
  },
  {
    symbol: "KO", group: "Consumer",
    simple: "Coca Cola makes the syrups and brands behind Coke, Sprite and many other drinks. Bottling partners mix and sell them, so Coca Cola keeps a light business with steady profits.",
    makesMoney: ["Selling drink concentrate and syrup to bottlers.", "Brands such as Coke, Sprite, Fanta, Dasani and Costa.", "Sales in more than 200 countries."],
    movesStock: ["How many drinks are sold around the world.", "Costs for ingredients and packaging, and exchange rates.", "Changing tastes toward less sugary drinks."],
  },
  {
    symbol: "DIS", group: "Consumer",
    simple: "Disney owns movie studios, TV channels, streaming services and theme parks. Families pay to watch its stories and visit its parks.",
    makesMoney: ["Theme parks, resorts and cruises.", "Streaming on Disney+, Hulu and ESPN+.", "Movies, TV channels and toys and merchandise."],
    movesStock: ["Visitor numbers and prices at the parks.", "Streaming subscribers and profit.", "Whether new movies are hits."],
  },
  {
    symbol: "BRK.B", group: "Energy and holdings",
    simple: "Berkshire Hathaway is a giant holding company run for many years by Warren Buffett. It owns whole businesses like GEICO insurance and BNSF railroad, and big stakes in companies like Apple.",
    makesMoney: ["Insurance, including GEICO, which also gives it cash to invest.", "Owning railroads, utilities and many other companies outright.", "Returns on a large stock portfolio and a big pile of cash."],
    movesStock: ["How the insurance businesses perform.", "The value of the stocks it holds.", "Leadership changes and what it decides to buy with its cash."],
  },
  {
    symbol: "PLTR", group: "Big tech",
    simple: "Palantir builds software that helps governments and companies make sense of huge amounts of data. Its tools are used for defense, intelligence and business decisions.",
    makesMoney: ["Government contracts, including defense and intelligence.", "Software for businesses, sold by subscription.", "AI tools that sit on top of customer data."],
    movesStock: ["New and renewed government contracts.", "How quickly commercial customers sign up.", "A high stock price that already expects a lot of growth."],
  },
  {
    symbol: "COIN", group: "Finance and payments",
    simple: "Coinbase is a place where people buy, sell and hold crypto such as Bitcoin. It earns a fee each time someone trades.",
    makesMoney: ["Trading fees on crypto purchases and sales.", "Interest and rewards on customers' holdings and the stablecoin USDC.", "Subscription and services products."],
    movesStock: ["Crypto prices, since trading rises when prices are moving.", "Crypto rules and court cases.", "Competition and fees from other exchanges."],
  },
];

const GUIDES = new Map(STOCK_GUIDES.map((guide) => [guide.symbol, guide]));

export function slugFor(symbol: string) {
  return symbol.toLowerCase().replace(/\./g, "-");
}

export function guidedStocks(): { stock: Stock; guide: StockGuide }[] {
  return STOCKS.flatMap((stock) => {
    const guide = GUIDES.get(stock.symbol);
    return guide ? [{ stock, guide }] : [];
  });
}

export function findGuide(slug: string) {
  return guidedStocks().find(({ stock }) => slugFor(stock.symbol) === slug.toLowerCase()) ?? null;
}

export function shortName(name: string) {
  return name
    .replace(/,? (Inc\.?|Corporation|Incorporated|Corp\.?|Co\.|& Co\.)$/i, "")
    .replace(/^The /, "")
    .replace(/\s*[-–—]\s*/g, " ");
}
