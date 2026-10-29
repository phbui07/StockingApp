import type {Lang} from '../services/i18n';

// Short, beginner-friendly descriptions for the stocks and indices the app
// features, so the About tab works offline and in both languages. Stick to
// facts that don't go stale (no CEOs, headcounts or prices).

type Localized = Record<Lang, string>;

export interface CompanyAbout {
  since: number;
  website?: string;
  headquarters?: Localized;
  sector?: Localized;
  description: Localized;
}

export const COMPANY_ABOUT: Record<string, CompanyAbout> = {
  AAPL: {
    since: 1976,
    website: 'apple.com',
    headquarters: {
      vi: 'Cupertino, California, Hoa Kỳ',
      en: 'Cupertino, California, USA',
    },
    sector: {vi: 'Công nghệ', en: 'Technology'},
    description: {
      vi: 'Apple thiết kế iPhone, Mac, iPad, Apple Watch và AirPods, đồng thời bán các dịch vụ như App Store, iCloud và Apple Music. iPhone mang lại khoảng một nửa doanh thu, còn mảng dịch vụ là mảng tăng trưởng nhanh nhất.',
      en: 'Apple designs the iPhone, Mac, iPad, Apple Watch and AirPods, and sells services such as the App Store, iCloud and Apple Music. The iPhone brings in about half of its revenue, while services are its fastest-growing business.',
    },
  },
  MSFT: {
    since: 1975,
    website: 'microsoft.com',
    headquarters: {
      vi: 'Redmond, Washington, Hoa Kỳ',
      en: 'Redmond, Washington, USA',
    },
    sector: {vi: 'Công nghệ', en: 'Technology'},
    description: {
      vi: 'Microsoft phát triển Windows và Microsoft 365 (Word, Excel, Teams), đồng thời vận hành Azure, một trong những nền tảng điện toán đám mây lớn nhất thế giới. Công ty cũng sở hữu LinkedIn, GitHub và Xbox. Phần lớn doanh thu đến từ việc bán phần mềm và dịch vụ đám mây cho doanh nghiệp.',
      en: "Microsoft makes Windows and Microsoft 365 (Word, Excel, Teams) and runs Azure, one of the world's largest cloud platforms. It also owns LinkedIn, GitHub and Xbox. Most of its money comes from selling software and cloud services to businesses.",
    },
  },
  NVDA: {
    since: 1993,
    website: 'nvidia.com',
    headquarters: {
      vi: 'Santa Clara, California, Hoa Kỳ',
      en: 'Santa Clara, California, USA',
    },
    sector: {vi: 'Bán dẫn', en: 'Semiconductors'},
    description: {
      vi: 'NVIDIA thiết kế bộ xử lý đồ họa (GPU). Ban đầu GPU dùng cho trò chơi điện tử, nay là loại chip chính để huấn luyện và chạy AI trong các trung tâm dữ liệu, mảng chiếm phần lớn doanh thu. NVIDIA chỉ thiết kế chip, còn việc sản xuất do các đối tác như TSMC đảm nhận.',
      en: 'NVIDIA designs graphics processors (GPUs). They started out powering video games and are now the main chips used to train and run AI in data centers, which make up most of its sales. NVIDIA designs its chips and has partners such as TSMC manufacture them.',
    },
  },
  AMZN: {
    since: 1994,
    website: 'amazon.com',
    headquarters: {
      vi: 'Seattle, Washington, Hoa Kỳ',
      en: 'Seattle, Washington, USA',
    },
    sector: {vi: 'Bán lẻ & điện toán đám mây', en: 'Retail & cloud'},
    description: {
      vi: 'Amazon vận hành cửa hàng trực tuyến lớn nhất thế giới và chương trình thành viên Prime. Mảng điện toán đám mây Amazon Web Services (AWS) cho các công ty khác thuê hạ tầng máy tính và mang lại một phần lớn lợi nhuận. Amazon còn bán quảng cáo và thiết bị như Kindle, Echo.',
      en: "Amazon runs the world's largest online store and the Prime membership program. Its cloud business, Amazon Web Services (AWS), rents computing power to other companies and earns a large share of Amazon's profit. It also sells advertising and devices like Kindle and Echo.",
    },
  },
  GOOGL: {
    since: 1998,
    website: 'abc.xyz',
    headquarters: {
      vi: 'Mountain View, California, Hoa Kỳ',
      en: 'Mountain View, California, USA',
    },
    sector: {vi: 'Internet & quảng cáo', en: 'Internet & advertising'},
    description: {
      vi: 'Alphabet là công ty mẹ của Google, sở hữu Google Search, YouTube, Android, Chrome và Google Cloud. Phần lớn doanh thu đến từ quảng cáo hiển thị trên các dịch vụ này. Công ty cũng đầu tư vào các dự án mới như xe tự lái Waymo.',
      en: "Alphabet is Google's parent company. It owns Google Search, YouTube, Android, Chrome and Google Cloud, and makes most of its money from the ads shown across them. It also invests in newer bets such as Waymo self-driving cars.",
    },
  },
  META: {
    since: 2004,
    website: 'meta.com',
    headquarters: {
      vi: 'Menlo Park, California, Hoa Kỳ',
      en: 'Menlo Park, California, USA',
    },
    sector: {vi: 'Internet & mạng xã hội', en: 'Internet & social media'},
    description: {
      vi: 'Meta (trước đây là Facebook) sở hữu Facebook, Instagram, WhatsApp, Messenger và Threads, được hàng tỷ người sử dụng mỗi ngày. Gần như toàn bộ doanh thu đến từ quảng cáo. Công ty cũng đầu tư mạnh vào AI, thực tế ảo và kính thông minh qua bộ phận Reality Labs.',
      en: 'Meta (formerly Facebook) owns Facebook, Instagram, WhatsApp, Messenger and Threads, used by billions of people every day. Almost all of its revenue comes from advertising. It also spends heavily on AI, virtual reality and smart glasses through its Reality Labs division.',
    },
  },
  TSLA: {
    since: 2003,
    website: 'tesla.com',
    headquarters: {vi: 'Austin, Texas, Hoa Kỳ', en: 'Austin, Texas, USA'},
    sector: {vi: 'Ô tô & năng lượng', en: 'Automotive & energy'},
    description: {
      vi: 'Tesla sản xuất ô tô điện như Model 3, Model Y, Cybertruck và bán pin lưu trữ năng lượng cho hộ gia đình và lưới điện. Giá cổ phiếu Tesla nổi tiếng biến động mạnh vì nhà đầu tư còn đặt cược vào các sản phẩm tương lai như taxi tự lái và robot.',
      en: 'Tesla makes electric cars, including the Model 3, Model Y and Cybertruck, and sells batteries that store energy for homes and power grids. Its share price is known for big swings because investors also bet on future products like self-driving taxis and robots.',
    },
  },
  NFLX: {
    since: 1997,
    website: 'netflix.com',
    headquarters: {
      vi: 'Los Gatos, California, Hoa Kỳ',
      en: 'Los Gatos, California, USA',
    },
    sector: {vi: 'Giải trí', en: 'Entertainment'},
    description: {
      vi: 'Netflix là dịch vụ xem phim trực tuyến với hàng trăm triệu thành viên trả phí trên toàn thế giới. Công ty khởi đầu bằng việc cho thuê đĩa DVD qua bưu điện, nay tự sản xuất phim, series và trò chơi. Doanh thu đến từ phí thuê bao hằng tháng, kể cả một gói rẻ hơn có quảng cáo.',
      en: 'Netflix is a streaming service with hundreds of millions of paying members worldwide. It started out renting DVDs by mail and now produces its own series, films and games. Its revenue comes from monthly subscriptions, including a cheaper plan with ads.',
    },
  },
  AMD: {
    since: 1969,
    website: 'amd.com',
    headquarters: {
      vi: 'Santa Clara, California, Hoa Kỳ',
      en: 'Santa Clara, California, USA',
    },
    sector: {vi: 'Bán dẫn', en: 'Semiconductors'},
    description: {
      vi: 'AMD (Advanced Micro Devices) thiết kế bộ xử lý (CPU) và chip đồ họa (GPU) cho máy tính, máy chơi game, máy chủ và trung tâm dữ liệu AI, cạnh tranh với Intel và NVIDIA. Giống NVIDIA, AMD thiết kế chip và thuê TSMC sản xuất.',
      en: 'AMD (Advanced Micro Devices) designs processors (CPUs) and graphics chips (GPUs) for PCs, game consoles, servers and AI data centers, competing with Intel and NVIDIA. Like NVIDIA, it designs its chips and has TSMC manufacture them.',
    },
  },

  // Indices
  '^GSPC': {
    since: 1957,
    description: {
      vi: 'S&P 500 theo dõi 500 công ty lớn nhất nước Mỹ, tính theo giá trị vốn hóa, nên các công ty khổng lồ như Apple hay NVIDIA ảnh hưởng nhiều nhất. Đây là thước đo phổ biến nhất cho thị trường chứng khoán Mỹ. Bạn không thể mua trực tiếp một chỉ số, nhưng có thể mua quỹ chỉ số như SPY hoặc VOO.',
      en: "The S&P 500 tracks 500 of the largest US companies, weighted by their market value, so giants like Apple and NVIDIA move it the most. It's the most common yardstick for the US stock market. You can't buy an index itself, but index funds such as SPY or VOO follow it.",
    },
  },
  '^IXIC': {
    since: 1971,
    description: {
      vi: 'Nasdaq Composite gồm gần như toàn bộ công ty niêm yết trên sàn Nasdaq, tổng cộng vài nghìn mã. Vì nhiều công ty trong đó thuộc ngành công nghệ, chỉ số này thường tăng giảm mạnh hơn S&P 500.',
      en: 'The Nasdaq Composite includes almost every company listed on the Nasdaq exchange, several thousand in total. Because many of them are technology companies, it usually rises and falls more sharply than the S&P 500.',
    },
  },
  '^DJI': {
    since: 1896,
    description: {
      vi: 'Dow Jones Industrial Average theo dõi 30 công ty lớn, nổi tiếng của Mỹ và là một trong những chỉ số lâu đời nhất. Khác với S&P 500, Dow tính theo giá cổ phiếu, nên cổ phiếu có giá cao ảnh hưởng nhiều hơn, bất kể quy mô công ty.',
      en: "The Dow Jones Industrial Average follows 30 large, well-known US companies and is one of the oldest market indexes. Unlike the S&P 500, it's weighted by share price, so a stock with a higher price moves it more regardless of the company's size.",
    },
  },
  '^FTSE': {
    since: 1984,
    description: {
      vi: 'FTSE 100 theo dõi 100 công ty lớn nhất trên Sở Giao dịch Chứng khoán London, như AstraZeneca, Shell và HSBC. Nhiều công ty trong số này kiếm phần lớn doanh thu ngoài nước Anh, nên chỉ số phản ánh kinh doanh toàn cầu không kém gì kinh tế Anh.',
      en: 'The FTSE 100 tracks the 100 largest companies on the London Stock Exchange, such as AstraZeneca, Shell and HSBC. Many of them earn most of their money outside the UK, so it reflects global business as much as the British economy.',
    },
  },
  '^N225': {
    since: 1950,
    description: {
      vi: 'Nikkei 225 theo dõi 225 công ty hàng đầu trên Sở Giao dịch Chứng khoán Tokyo, như Toyota, Sony và Fast Retailing (Uniqlo). Giống Dow Jones, chỉ số này tính theo giá cổ phiếu. Đây là thước đo chính của thị trường chứng khoán Nhật Bản.',
      en: "The Nikkei 225 follows 225 leading companies on the Tokyo Stock Exchange, including Toyota, Sony and Fast Retailing (Uniqlo). Like the Dow, it's weighted by share price. It's the main gauge of Japan's stock market.",
    },
  },
  '000001.SS': {
    since: 1991,
    description: {
      vi: 'SSE Composite (chỉ số Thượng Hải) gồm tất cả cổ phiếu giao dịch trên Sở Giao dịch Chứng khoán Thượng Hải, một trong hai sàn chính của Trung Quốc. Các ngân hàng và công ty năng lượng lớn thuộc sở hữu nhà nước chiếm tỷ trọng đáng kể.',
      en: "The SSE Composite (Shanghai Composite) includes all stocks traded on the Shanghai Stock Exchange, one of China's two main exchanges. Large state-owned banks and energy companies make up a big part of it.",
    },
  },
};
