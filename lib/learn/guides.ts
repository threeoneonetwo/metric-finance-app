// Longer plain English explainers. Never advice. No dashes anywhere in this content.
export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  terms: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "why-do-stocks-go-up-and-down",
    title: "Why Do Stocks Go Up and Down? Explained Like You're 5",
    description: "A simple explanation of why stock prices change every day, from supply and demand to earnings, news and interest rates.",
    intro: "A stock price is just the latest price two people agreed on. When more people want to buy than sell, the price rises. When more want to sell, it falls. The interesting part is what makes people want to buy or sell.",
    sections: [
      { heading: "Supply and demand, like a lemonade stand", paragraphs: ["Imagine a lemonade stand where everyone suddenly wants a cup. The seller can ask for more money. Stocks work the same way. If lots of investors want a company's shares, buyers compete and the price climbs. If many want out, sellers compete and the price drops."] },
      { heading: "Company results", paragraphs: ["Every three months, public companies share how much they sold and earned. If results beat what experts expected, people often rush to buy. If results disappoint, they often sell. What the company says about the next few months can matter even more than the past quarter."] },
      { heading: "News and big events", paragraphs: ["New products, lawsuits, new rules, a change of leadership or a big customer deal can all change what investors think a company is worth. So can news about the whole economy, such as inflation, jobs and what the central bank does with interest rates."] },
      { heading: "Interest rates and mood", paragraphs: ["When interest rates are higher, borrowing costs more and safe savings pay more, so stocks can look less attractive. When rates fall, stocks often look better. Investor mood matters too. Fear can push prices down faster than facts alone would, and excitement can push them up."] },
      { heading: "The big takeaway", paragraphs: ["Stocks move because people keep changing their minds about what a company will earn in the future. That is why a daily brief that explains the reason behind each move is more useful than just seeing a number turn red or green."] },
    ],
    terms: ["earnings-report", "guidance", "volatility", "market-correction"],
  },
  {
    slug: "how-to-read-a-stock-quote",
    title: "How to Read a Stock Quote: A Simple Guide for Beginners",
    description: "Learn what every number on a stock quote means, including price, change, volume, market cap, P/E ratio and the 52 week range.",
    intro: "A stock quote looks like a wall of numbers, but each one answers a simple question. Here is what the main pieces mean in plain English.",
    sections: [
      { heading: "Ticker and price", paragraphs: ["The ticker is the stock's short nickname, such as AAPL. The price is what one share costs right now. During market hours it updates constantly, and after the close it shows the last trade of the day."] },
      { heading: "Change and percent change", paragraphs: ["This shows how much the price moved compared with yesterday's close. A green number with a plus sign means it rose. A red number with a minus sign means it fell. The percent change is easier to compare across stocks than the dollar change."] },
      { heading: "Volume", paragraphs: ["Volume is how many shares were traded. Compare it with the stock's normal volume. A move on unusually high volume suggests people really cared about something."] },
      { heading: "Market cap and P/E ratio", paragraphs: ["Market cap is the total value of the company. The P/E ratio shows how much investors pay for each dollar of earnings. Together they tell you how big the company is and how richly the market is valuing it."] },
      { heading: "52 week range", paragraphs: ["This shows the lowest and highest prices over the past year. If today's price sits near the top, the stock has had a strong year. Near the bottom means it has been struggling."] },
    ],
    terms: ["stock-ticker", "volume", "market-cap", "pe-ratio"],
  },
  {
    slug: "what-happens-when-the-stock-market-closes",
    title: "What Happens When the Stock Market Closes at 4 PM?",
    description: "Find out what the closing bell means, why prices matter at the close, and what after hours trading is, in plain English.",
    intro: "The regular US stock market is open from 9:30 AM to 4 PM Eastern time on weekdays. When the closing bell rings, trading does not completely stop, but the official day is over.",
    sections: [
      { heading: "The closing price", paragraphs: ["The last price of the regular session is called the closing price. It is the number used to say how much a stock rose or fell that day, and it is the starting point for tomorrow's change."] },
      { heading: "After hours trading", paragraphs: ["Some trading continues after 4 PM, and again before the market opens. There are fewer buyers and sellers then, so prices can jump around more. Many companies publish their earnings reports right after the close."] },
      { heading: "Why 5 PM is a good time to catch up", paragraphs: ["Once the dust settles after the close, the full story of the day is available: how each stock finished, what news drove it and what is coming next. That is why Metric Finance posts your brief at 5 PM Eastern, so the whole day is explained in one read."] },
      { heading: "Weekends and holidays", paragraphs: ["The market is closed on weekends and on some public holidays. On those days there is no trading and no new closing price."] },
    ],
    terms: ["stock-exchange", "earnings-report", "share-price"],
  },
  {
    slug: "how-to-start-following-stocks",
    title: "How to Start Following Stocks Without Risking Any Money",
    description: "A calm beginner guide to learning how stocks work by following companies you already know, before you ever invest a dollar.",
    intro: "You do not need to buy a single share to start learning. Following a handful of companies is the easiest way to build intuition about how the market behaves.",
    sections: [
      { heading: "Start with companies you already know", paragraphs: ["Pick up to five companies whose products you use or understand. It is much easier to learn why a stock moves when you already know what the company does."] },
      { heading: "Watch what happens around news", paragraphs: ["Notice what happens to the price after an earnings report, a product launch or a big headline. Over a few weeks you will start to see patterns in what the market cares about."] },
      { heading: "Learn five key words", paragraphs: ["You do not need a finance degree. Start with market cap, P/E ratio, earnings per share, dividend and volatility. Those cover most of what you will read in the news."] },
      { heading: "Use a daily explainer", paragraphs: ["A short daily brief on your chosen stocks, written in plain language, turns a few minutes a day into a real education. It also means you never have to decode a wall of jargon."] },
      { heading: "Remember this is education", paragraphs: ["Learning how companies and markets work is not the same as getting investment advice. Any decision about money is yours, ideally with a qualified professional if you need one."] },
    ],
    terms: ["market-cap", "pe-ratio", "eps", "dividend", "volatility"],
  },
  {
    slug: "what-is-earnings-season",
    title: "What Is Earnings Season and Why Does It Move Stocks?",
    description: "Earnings season is when public companies report results. Learn why it matters, what analysts watch and why prices jump.",
    intro: "Four times a year, nearly every public company reports how it did. The weeks when most of them report are called earnings season, and it is one of the busiest times in the market.",
    sections: [
      { heading: "When it happens", paragraphs: ["Earnings season usually kicks off a couple of weeks after each quarter ends, around January, April, July and October. Large banks tend to go first and big technology companies follow."] },
      { heading: "What gets reported", paragraphs: ["Companies share their sales, their profit and their earnings per share. They often also give guidance, which is a forecast for the coming quarter or year."] },
      { heading: "Why the stock can jump or drop", paragraphs: ["Analysts publish estimates before each report. A stock usually moves based on whether the real numbers beat or missed those estimates, and on what the company says about the future. A company can earn a record profit and still fall if investors hoped for more."] },
      { heading: "How to follow along", paragraphs: ["Look up the date of the next report for the stocks you follow. Reading a short plain English summary the same evening helps you see what mattered without sifting through the full report."] },
    ],
    terms: ["earnings-report", "eps", "guidance", "analyst-rating"],
  },
  {
    slug: "stocks-vs-etfs",
    title: "Stocks vs ETFs: What Is the Difference?",
    description: "Stocks give you a piece of one company, while ETFs give you a basket of many. Learn how they differ and when people use each.",
    intro: "Both stocks and ETFs trade on an exchange and show a price you can look up all day. The difference is what you own when you buy one.",
    sections: [
      { heading: "A stock is one company", paragraphs: ["When you buy a share of a stock, you own a small piece of a single company. Its price depends on how that one business is doing, so it can move a lot."] },
      { heading: "An ETF is a basket", paragraphs: ["An exchange traded fund holds many investments at once, such as hundreds of stocks. Buying one share of the ETF gives you a small slice of everything inside. Many ETFs follow an index like the S&P 500."] },
      { heading: "Risk and spread", paragraphs: ["Because an ETF spreads your money across many holdings, a single company having a bad day usually matters less. That idea is called diversification. A single stock carries more risk but also more upside if that company does well."] },
      { heading: "Costs and effort", paragraphs: ["ETFs charge a small yearly fee called an expense ratio. A single stock has no such fee, but it takes more effort to research. Many people follow individual stocks to learn, and use ETFs for broad exposure."] },
    ],
    terms: ["etf", "index-fund", "diversification", "s-and-p-500"],
  },
  {
    slug: "what-is-a-stock-market-index",
    title: "What Is a Stock Market Index? S&P 500, Nasdaq and Dow Explained",
    description: "A stock market index is a scoreboard for a group of companies. Learn how the S&P 500, Nasdaq Composite and Dow differ.",
    intro: "When the news says the market is up, it usually means a stock market index rose. An index is a list of companies whose combined performance is tracked as a single number.",
    sections: [
      { heading: "The S&P 500", paragraphs: ["This index follows 500 of the largest US companies. It covers about four fifths of the value of the US stock market, so it is the most common measure of how stocks are doing."] },
      { heading: "The Nasdaq Composite", paragraphs: ["This index tracks thousands of companies listed on the Nasdaq. Many are technology and growth companies, so it tends to move more when tech is hot or cold."] },
      { heading: "The Dow Jones Industrial Average", paragraphs: ["The Dow follows just 30 large, well known companies. It is the oldest of the three and is still widely quoted, although it is a narrower picture of the market."] },
      { heading: "Why indexes matter", paragraphs: ["Indexes give you a benchmark. If your stock rose 2 percent on a day when the S&P 500 rose 3 percent, it lagged the market. They also form the basis of index funds and ETFs."] },
    ],
    terms: ["s-and-p-500", "nasdaq-composite", "dow-jones", "index-fund"],
  },
  {
    slug: "how-to-read-an-earnings-report",
    title: "How to Read an Earnings Report in 5 Minutes",
    description: "A plain English walkthrough of the numbers in a company's quarterly earnings report and what to look for first.",
    intro: "An earnings report can run dozens of pages, but you can get the story in five minutes if you know where to look.",
    sections: [
      { heading: "1. Revenue", paragraphs: ["Start with sales. Is revenue higher than a year ago? Did it beat what analysts expected? Growing sales mean the company is winning customers."] },
      { heading: "2. Earnings per share", paragraphs: ["Next, look at profit per share and compare it with the estimate. Beating the estimate is called a beat, and falling short is a miss."] },
      { heading: "3. Margins", paragraphs: ["Check the profit margin. If sales rose but margins fell, costs may be growing faster than the business. If margins rose, the company is becoming more efficient."] },
      { heading: "4. Guidance", paragraphs: ["Read what the company expects next. Raised guidance is usually a good sign, and lowered guidance can hurt the stock even when the quarter was strong."] },
      { heading: "5. The big theme", paragraphs: ["Finally, find the one headline reason for the quarter, such as a new product, a weak region or higher costs. That is what the market will talk about the next day."] },
    ],
    terms: ["revenue", "eps", "profit-margin", "guidance"],
  },
];

export function findGuide(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug) ?? null;
}
