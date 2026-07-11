import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = process.env.OTAKUDESU_URL || 'https://otakudesu.blog';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.104 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
];

let uaIndex = 0;

export function getSlugFromUrl(url: string): string | undefined {
  if (!url) return undefined;
  // Clean trailing slash
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const parts = cleanUrl.split('/');
  return parts[parts.length - 1];
}

export function getTypeFromUrl(url: string): string | undefined {
  if (!url) return undefined;
  if (url.includes('/anime/')) return 'anime';
  if (url.includes('/episode/')) return 'episode';
  if (url.includes('/genres/')) return 'genre';
  if (url.includes('/lengkap/') || url.includes('/batch/')) return 'batch';
  return undefined;
}

class CookieJar {
  private cookies: Record<string, string> = {};

  update(headers: any) {
    const setCookie = headers['set-cookie'];
    if (!setCookie) return;
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const cookieStr of cookies) {
      const parts = cookieStr.split(';')[0].split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        this.cookies[key] = value;
      }
    }
  }

  getString(): string {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  clear() {
    this.cookies = {};
  }
}

function randomDelay(min = 300, max = 800) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

function getHeaders(ref = BASE_URL, cookie = '') {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  const isMobile = ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android');
  const platform = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : 'Linux';
  const headers: Record<string, string> = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': ref || BASE_URL,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Sec-Ch-Ua': `"${ua.includes('Chrome') ? 'Google Chrome' : 'Chromium'}"`,
    'Sec-Ch-Ua-Mobile': isMobile ? '?1' : '?0',
    'Sec-Ch-Ua-Platform': `"${platform}"`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive'
  };
  if (cookie) headers['Cookie'] = cookie;
  return headers;
}

async function request(method: string, url: string, data: any = null, headers: any = {}, retries = 5): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay(300, 800);
      let finalUrl = url;
      if (process.env.SCRAPER_PROXY_PREFIX) {
        finalUrl = process.env.SCRAPER_PROXY_PREFIX + encodeURIComponent(url);
      }
      const config: any = {
        method,
        url: finalUrl,
        headers,
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
        maxRedirects: 5,
        decompress: true,
        validateStatus: (status: number) => status >= 200 && status < 400
      };
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }
      if (process.env.SCRAPER_PROXY) {
        try {
          const proxyUrl = new URL(process.env.SCRAPER_PROXY);
          config.proxy = {
            protocol: proxyUrl.protocol.replace(':', ''),
            host: proxyUrl.hostname,
            port: parseInt(proxyUrl.port, 10),
            auth: proxyUrl.username ? {
              username: decodeURIComponent(proxyUrl.username),
              password: decodeURIComponent(proxyUrl.password)
            } : undefined
          };
        } catch (err) {
          console.error('Invalid SCRAPER_PROXY environment variable:', err);
        }
      }
      const res = await axios(config);
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG_SCRAPER === 'true') {
        console.log(`[Scraper] ${method} ${url} -> ${res.status}`);
      }
      return res;
    } catch (e: any) {
      console.error(`[Scraper Error] ${method} ${url}:`, e.message);
      if (i < retries - 1) await randomDelay(1500, 4000);
      else throw e;
    }
  }
}

export class OtakudesuScraper {
  private base = BASE_URL;
  private creator = 'rynaqrtz';
  private cookieJar = new CookieJar();

  private async _fetchHTML(url: string, retries = 5): Promise<string> {
    const headers = getHeaders(url, this.cookieJar.getString());
    const res = await request('GET', url, null, headers, retries);
    this.cookieJar.update(res.headers);
    
    let html = res.data;
    if (typeof html !== 'string') {
      // Handle common proxy JSON response wrappers
      if (html && typeof html === 'object') {
        html = html.contents || html.content || html.data || html.html || JSON.stringify(html);
      } else {
        html = String(html);
      }
    }

    if (html.includes('cf-browser-verification') || html.includes('Cloudflare')) {
      console.warn(`[Scraper Warning] Cloudflare detected at ${url}`);
    }

    return html;
  }

  private async _postAjax(payload: any, retries = 5): Promise<any> {
    const params = new URLSearchParams(payload);
    const url = `${this.base}/wp-admin/admin-ajax.php`;
    const headers = {
      ...getHeaders(this.base, this.cookieJar.getString()),
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const res = await request('POST', url, params.toString(), headers, retries);
    this.cookieJar.update(res.headers);
    return res.data;
  }

  private _clean(obj: any): any {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) return obj.map(i => this._clean(i));
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        const val = this._clean(obj[key]);
        if (val !== undefined) result[key] = val;
      }
      return Object.keys(result).length ? result : undefined;
    }
    return obj;
  }

  private _buildResponse(page: string, url: string, data: any) {
    return this._clean({
      creator: this.creator,
      page,
      url,
      data
    });
  }

  private _parsePagination($: cheerio.CheerioAPI) {
    const result: any = { current: 1, next: null, hasNext: false, total: null };
    const pageLinks: { text: string; href: string }[] = [];
    $('.pagination a, .pagination span, .page-numbers, .pagenavix a, .pagenavix span').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href) pageLinks.push({ text, href });
    });
    const numbers = pageLinks.filter(l => /^\d+$/.test(l.text)).map(l => parseInt(l.text));
    if (numbers.length) result.total = Math.max(...numbers);
    const current = $('.pagination .page-numbers.current, .pagenavix .page-numbers.current').first();
    if (current.length) {
      const t = current.text().trim();
      if (/^\d+$/.test(t)) result.current = parseInt(t);
    }
    if (result.total && result.current < result.total) {
      result.hasNext = true;
      const nextLink = pageLinks.find(l => l.text === 'Next' || l.text === '»' || l.text.toLowerCase().includes('next'));
      if (nextLink && nextLink.href) {
        result.next = nextLink.href.startsWith('http') ? nextLink.href : this.base + nextLink.href;
      }
    }
    return result;
  }

  private _parseCardDetpost($: cheerio.CheerioAPI, element: any) {
    const $el = $(element);
    const link = $el.find('.thumb a').attr('href') || $el.find('a').first().attr('href');
    const title = $el.find('.jdlflm').text().trim() || $el.find('h2').text().trim() || $el.find('.thumb a').attr('title')?.trim();
    const poster = $el.find('.thumbz img').attr('src') || $el.find('img').first().attr('src') || null;
    const episode = $el.find('.epz').text().trim() || $el.find('.epztipe').text().trim() || null;
    const day = $el.find('.epztipe').text().trim() || null;
    const date = $el.find('.newnime').text().trim() || null;
    
    if (!link || !title) return null;

    const fullUrl = link.startsWith('http') ? link : this.base + (link.startsWith('/') ? link : '/' + link);
    const slug = getSlugFromUrl(fullUrl);
    const type = getTypeFromUrl(fullUrl);

    return {
      title,
      url: fullUrl,
      slug,
      type,
      poster,
      episode,
      day,
      date
    };
  }

  private _parseCardColAnime($: cheerio.CheerioAPI, element: any) {
    const $el = $(element);
    const link = $el.find('.col-anime-title a').attr('href');
    const title = $el.find('.col-anime-title a').text().trim();
    const studio = $el.find('.col-anime-studio').text().trim() || null;
    const eps = $el.find('.col-anime-eps').text().trim() || null;
    const rating = $el.find('.col-anime-rating').text().trim() || null;
    const genres = $el.find('.col-anime-genre a').map((_, a) => $(a).text()).get() || [];
    const poster = $el.find('.col-anime-cover img').attr('src') || null;
    const synopsis = $el.find('.col-synopsis p').text().trim() || null;
    const season = $el.find('.col-anime-date').text().trim() || null;
    if (!link || !title) return null;

    const fullUrl = link.startsWith('http') ? link : this.base + link;
    const slug = getSlugFromUrl(fullUrl);
    const type = getTypeFromUrl(fullUrl);

    return {
      title,
      url: fullUrl,
      slug,
      type,
      studio,
      episodes: eps,
      rating,
      genres,
      poster,
      synopsis,
      season
    };
  }

  private _parseGenreList($: cheerio.CheerioAPI) {
    const genres: any[] = [];
    $('.genres li a').each((i, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      const link = $el.attr('href');
      if (name && link) {
        const slug = link.replace(/\/genres\/([^\/]+)\/?/, '$1');
        genres.push({
          name,
          slug,
          url: link.startsWith('http') ? link : this.base + link
        });
      }
    });
    return genres;
  }

  private _parseSchedule($: cheerio.CheerioAPI) {
    const schedule: Record<string, any[]> = {};
    $('.kglist321').each((i, el) => {
      const $el = $(el);
      const day = $el.find('h2').text().trim();
      const items: any[] = [];
      $el.find('ul li a').each((j, a) => {
        const $a = $(a);
        const href = $a.attr('href') || '';
        const fullUrl = href.startsWith('http') ? href : this.base + href;
        items.push({
          title: $a.text().trim(),
          url: fullUrl,
          slug: getSlugFromUrl(fullUrl)
        });
      });
      if (day && items.length) schedule[day] = items;
    });
    return schedule;
  }

  private _parseEpisodeList($: cheerio.CheerioAPI) {
    const episodes: any[] = [];
    $('.episodelist ul li').each((i, el) => {
      const $el = $(el);
      const $a = $el.find('a');
      const title = $a.text().trim();
      const href = $a.attr('href');
      const date = $el.find('.zeebr').text().trim() || null;
      if (href && title) {
        const fullUrl = href.startsWith('http') ? href : this.base + href;
        const slug = getSlugFromUrl(fullUrl);
        const type = getTypeFromUrl(fullUrl) || 'episode';
        episodes.push({
          title,
          slug,
          url: fullUrl,
          releaseDate: date,
          type
        });
      }
    });
    return episodes;
  }

  private _extractPostId($: cheerio.CheerioAPI) {
    const ids = new Set<number>();
    $('[data-content]').each((i, el) => {
      const content = $(el).attr('data-content');
      if (content) {
        try {
          const decoded = Buffer.from(content, 'base64').toString('utf-8');
          const parsed = JSON.parse(decoded);
          if (parsed.id) ids.add(parsed.id);
        } catch (e) {}
      }
    });
    $('[id^="post-"]').each((i, el) => {
      const id = $(el).attr('id');
      const match = id?.match(/post-(\d+)/);
      if (match) ids.add(parseInt(match[1]));
    });
    const html = $.html();
    const scriptMatches = html.match(/post[_\s]*id[_\s]*[:=]\s*["']?(\d+)["']?/gi);
    if (scriptMatches) {
      scriptMatches.forEach(m => {
        const num = m.match(/\d+/);
        if (num) ids.add(parseInt(num[0]));
      });
    }
    return ids.size > 0 ? [...ids][0] : null;
  }

  private async _getNonce() {
    try {
      const res = await this._postAjax({ action: 'aa1208d27f29ca340c92c66d1926f13f' });
      return res?.data || null;
    } catch (e) {
      return null;
    }
  }

  private async _getStreamUrl(postId: number, index: number, quality: string, nonce: string) {
    const payload = {
      action: '2a3505c93b0035d3f455df82bf976b84',
      id: postId,
      i: index,
      q: quality,
      nonce
    };
    try {
      const res = await this._postAjax(payload);
      if (!res || !res.data) return null;
      const html = Buffer.from(res.data, 'base64').toString('utf-8');
      const $ = cheerio.load(html);
      return $('iframe').attr('src') || null;
    } catch (e) {
      return null;
    }
  }

  private async _extractStreams(html: string) {
    const $ = cheerio.load(html);
    const result: Record<string, string> = {};

    // Extract default iframe from initial HTML as a highly resilient, zero-latency fallback
    const defaultIframeSrc = $('#pembed iframe').attr('src') || 
                             $('.responsive-embed-stream iframe').attr('src') || 
                             $('iframe').first().attr('src');
    if (defaultIframeSrc) {
      result['Default_Player'] = defaultIframeSrc;
    }

    const postId = this._extractPostId($);
    const streamOptions: any[] = [];
    if (!postId) return { streams: result, streamOptions };

    const nonce = await this._getNonce();
    if (!nonce) return { streams: result, streamOptions };

    $('.mirrorstream a').each((j, a) => {
      const $a = $(a);
      const dataContent = $a.attr('data-content');
      if (dataContent) {
        try {
          const decoded = Buffer.from(dataContent, 'base64').toString('utf-8');
          const parsed = JSON.parse(decoded);
          if (parsed.id) {
            const host = $a.text().trim();
            const hostLower = host.toLowerCase();
            const isAllowed = hostLower.includes('mega') || 
                              hostLower.includes('odstream') || 
                              hostLower.includes('ondesuhd') ||
                              hostLower.includes('ondesu');
            
            if (isAllowed) {
              const key = `${parsed.q}_${host}`;
              streamOptions.push({
                key,
                quality: parsed.q,
                host,
                postId: parsed.id,
                i: parsed.i,
                q: parsed.q,
                nonce
              });
            }
          }
        } catch (e) {}
      }
    });

    return { streams: result, streamOptions };
  }

  async getStreamUrl(postId: number, index: number, quality: string, nonce: string) {
    return this._getStreamUrl(postId, index, quality, nonce);
  }

  async home() {
    const url = this.base + '/';
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    
    // Try multiple selectors for better resilience
    const selectors = [
      '.detpost:has(.epz)', 
      '.detpost', 
      '.venutama .vezone .vpost'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const card = this._parseCardDetpost($, el);
        if (card && !items.find(item => item.slug === card.slug)) {
          items.push(card);
        }
      });
      if (items.length > 0) break;
    }

    if (items.length === 0) {
      console.warn(`[Scraper Warning] No items found on home page using selectors. HTML length: ${html.length}`);
    }

    return this._buildResponse('home', url, { items });
  }

  async ongoing(page = 1) {
    const url = page === 1 ? this.base + '/ongoing-anime/' : this.base + `/ongoing-anime/page/${page}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    
    const selectors = ['.detpost', '.venutama .vezone .vpost', '.col-anime-con'];
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const card = this._parseCardDetpost($, el);
        if (card && !items.find(item => item.slug === card.slug)) {
          items.push(card);
        }
      });
      if (items.length > 0) break;
    }

    const pagination = this._parsePagination($);
    return this._buildResponse('ongoing', url, { pagination, items });
  }

  async complete(page = 1) {
    const url = page === 1 ? this.base + '/complete-anime/' : this.base + `/complete-anime/page/${page}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    
    const selectors = ['.detpost', '.venutama .vezone .vpost', '.col-anime-con'];
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const card = this._parseCardDetpost($, el);
        if (card && !items.find(item => item.slug === card.slug)) {
          items.push(card);
        }
      });
      if (items.length > 0) break;
    }

    const pagination = this._parsePagination($);
    return this._buildResponse('complete', url, { pagination, items });
  }

  async genreList() {
    const url = this.base + '/genre-list/';
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const genres = this._parseGenreList($);
    return this._buildResponse('genreList', url, { genres });
  }

  async genre(slug: string, page = 1) {
    const url = page === 1 ? this.base + `/genres/${slug}/` : this.base + `/genres/${slug}/page/${page}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.col-anime-con').each((i, el) => {
      const card = this._parseCardColAnime($, el);
      if (card) items.push(card);
    });
    const pagination = this._parsePagination($);
    return this._buildResponse('genre', url, { slug, pagination, items });
  }

  async jadwalRilis() {
    const url = this.base + '/jadwal-rilis/';
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const schedule = this._parseSchedule($);
    return this._buildResponse('jadwalRilis', url, { schedule });
  }

  async search(query: string) {
    const url = `${this.base}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.chivsrc li').each((i, el) => {
      const $el = $(el);
      const link = $el.find('h2 a').attr('href');
      const title = $el.find('h2 a').text().trim();
      const poster = $el.find('img').attr('src') || null;
      const genres = $el.find('.set:first-child a').map((_, a) => $(a).text()).get() || [];
      const status = $el.find('.set:nth-child(2)').text().replace('Status :', '').trim() || null;
      const ratingEl = $el.find('.set:contains("Rating")');
      const rating = ratingEl.length ? ratingEl.text().replace('Rating :', '').trim() : null;
      if (link && title) {
        const fullUrl = link.startsWith('http') ? link : this.base + link;
        const slug = getSlugFromUrl(fullUrl);
        const type = getTypeFromUrl(fullUrl);
        items.push({
          title,
          url: fullUrl,
          slug,
          type,
          poster,
          genres,
          status,
          rating
        });
      }
    });
    return this._buildResponse('search', url, { query, items });
  }

  async detail(slug: string) {
    const url = this.base + `/anime/${slug}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const title = $('.jdlrx h1').text().trim() || $('title').text().trim();
    const poster = $('.fotoanime img').attr('src') || null;
    const sinopsis = $('.sinopc p').text().trim() || null;
    const info: Record<string, string | null> = {};
    $('.infozin .infozingle p').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text.includes('Genre')) {
        const genreLinks = $el.find('a').map((_, a) => $(a).text()).get();
        info.genre = genreLinks.length ? genreLinks.join(', ') : null;
        return;
      }
      const parts = text.split(':');
      if (parts.length >= 2) {
        const key = parts[0].replace(/\s/g, '_').toLowerCase();
        const value = parts.slice(1).join(':').trim();
        if (key) info[key] = value;
      }
    });
    const episodes = this._parseEpisodeList($);
    const recommendations: any[] = [];
    $('.isi-recommend-anime-series .isi-konten').each((i, el) => {
      const $el = $(el);
      const link = $el.find('.judul-anime a').attr('href');
      const titleRec = $el.find('.judul-anime a').text().trim();
      const posterRec = $el.find('.gambar-konten img').attr('src') || null;
      if (link && titleRec) {
        const fullUrl = link.startsWith('http') ? link : this.base + link;
        recommendations.push({
          title: titleRec,
          url: fullUrl,
          slug: getSlugFromUrl(fullUrl),
          poster: posterRec
        });
      }
    });
    return this._buildResponse('detail', url, {
      title,
      poster,
      sinopsis,
      info,
      episodes,
      recommendations
    });
  }

  async episode(slug: string) {
    const url = this.base + `/episode/${slug}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const title = $('h1.posttl').text().trim() || $('title').text().trim();
    const { streams, streamOptions } = await this._extractStreams(html);
    const downloads: any[] = [];
    $('.download ul').each((i, ul) => {
      const $ul = $(ul);
      const group = $ul.prev('h4').text().trim() || $ul.prev('strong').text().trim() || 'Download';
      const items: any[] = [];
      $ul.find('li').each((j, li) => {
        const $li = $(li);
        const resolution = $li.find('strong').text().trim() || null;
        const size = $li.find('i').text().trim() || null;
        const links: any[] = [];
        $li.find('a').each((k, a) => {
          const $a = $(a);
          links.push({
            host: $a.text().trim(),
            url: $a.attr('href')
          });
        });
        if (links.length) items.push({ resolution, size, links });
      });
      if (items.length) downloads.push({ group, items });
    });

    let prevUrl = $('.prevnext .flir a:first-child').attr('href') || null;
    const allUrl = $('.prevnext .flir a:contains("See All")').attr('href') || null;
    let nextUrl = $('.prevnext .flir a:last-child').attr('href') || null;

    if (prevUrl && (prevUrl.includes('/anime/') || prevUrl === allUrl)) {
      prevUrl = null;
    }
    if (nextUrl && (nextUrl.includes('/anime/') || nextUrl === allUrl)) {
      nextUrl = null;
    }

    const nav = {
      prev: prevUrl ? getSlugFromUrl(prevUrl) : null,
      all: allUrl ? getSlugFromUrl(allUrl) : null,
      next: nextUrl ? getSlugFromUrl(nextUrl) : null
    };
    const otherEpisodes = this._parseEpisodeList($);
    const data: any = { title, streams, streamOptions, downloads, nav };
    if (otherEpisodes.length) data.otherEpisodes = otherEpisodes;
    return this._buildResponse('episode', url, data);
  }

  async batch(slug: string) {
    let url = this.base + `/lengkap/${slug}/`;
    let html = '';
    try {
      html = await this._fetchHTML(url);
    } catch (e) {
      url = this.base + `/batch/${slug}/`;
      html = await this._fetchHTML(url);
    }
    const $ = cheerio.load(html);
    const title = $('.jdlrx h1').text().trim() || $('title').text().trim();
    const downloads: any[] = [];
    $('.download ul').each((i, ul) => {
      const $ul = $(ul);
      const group = $ul.prev('h4').text().trim() || $ul.prev('strong').text().trim() || 'Batch';
      const items: any[] = [];
      $ul.find('li').each((j, li) => {
        const $li = $(li);
        const resolution = $li.find('strong').text().trim() || null;
        const size = $li.find('i').text().trim() || null;
        const links: any[] = [];
        $li.find('a').each((k, a) => {
          const $a = $(a);
          links.push({
            host: $a.text().trim(),
            url: $a.attr('href')
          });
        });
        if (links.length) items.push({ resolution, size, links });
      });
      if (items.length) downloads.push({ group, items });
    });
    return this._buildResponse('batch', url, { title, downloads });
  }

  async watch(slug: string) {
    const url = this.base + `/episode/${slug}/`;
    const html = await this._fetchHTML(url);
    const $ = cheerio.load(html);
    const title = $('h1.posttl').text().trim() || $('title').text().trim();
    const { streams, streamOptions } = await this._extractStreams(html);
    const downloads: any[] = [];
    $('.download ul').each((i, ul) => {
      const $ul = $(ul);
      const group = $ul.prev('h4').text().trim() || $ul.prev('strong').text().trim() || 'Download';
      const items: any[] = [];
      $ul.find('li').each((j, li) => {
        const $li = $(li);
        const resolution = $li.find('strong').text().trim() || null;
        const size = $li.find('i').text().trim() || null;
        const links: any[] = [];
        $li.find('a').each((k, a) => {
          const $a = $(a);
          links.push({
            host: $a.text().trim(),
            url: $a.attr('href')
          });
        });
        if (links.length) items.push({ resolution, size, links });
      });
      if (items.length) downloads.push({ group, items });
    });

    let prevUrl = $('.prevnext .flir a:first-child').attr('href') || null;
    const allUrl = $('.prevnext .flir a:contains("See All")').attr('href') || null;
    let nextUrl = $('.prevnext .flir a:last-child').attr('href') || null;

    if (prevUrl && (prevUrl.includes('/anime/') || prevUrl === allUrl)) {
      prevUrl = null;
    }
    if (nextUrl && (nextUrl.includes('/anime/') || nextUrl === allUrl)) {
      nextUrl = null;
    }

    const nav = {
      prev: prevUrl ? getSlugFromUrl(prevUrl) : null,
      all: allUrl ? getSlugFromUrl(allUrl) : null,
      next: nextUrl ? getSlugFromUrl(nextUrl) : null
    };
    return this._buildResponse('watch', url, { title, streams, streamOptions, downloads, nav });
  }

  resetCookie() {
    this.cookieJar.clear();
  }
}
