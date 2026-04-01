// 酷我听书刮削插件 (JavaScript 版本)

function initialize(context) {
    Ting.log.info('酷我听书刮削插件已初始化');
}

function shutdown() {
    Ting.log.info('酷我听书刮削插件正在关闭');
}

function cleanText(text) {
    if (!text) return '';
    // 可以根据需要去除一些广告等特殊字符
    return text.replace(/【.*?】/g, '').trim();
}

async function search(args) {
    const query = args.query || '';
    const page = args.page || 1;
    const narratorFilter = args.narrator;

    Ting.log.info(`搜索酷我听书: ${query}, 页码: ${page}, 演播筛选: ${narratorFilter || '无'}`);

    // 酷我听书的 pn 参数代表从第几条开始（0-based index）或页数。根据示例：pn=0&rn=100
    // 为了简化，假设 pn 就是以 0 开始的页码，或者按照 pageSize=20 来计算偏移
    const pageSize = 20;
    const pn = page - 1; 

    const url = `http://search.kuwo.cn/r.s?pn=${pn}&rn=${pageSize}&all=${encodeURIComponent(query)}&ft=album&newsearch=1&rformat=json&encoding=utf8&plat=pc&pcjson=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        let items = [];
        let total = 0;

        if (data && data.albumlist) {
            const albumlist = data.albumlist;
            total = parseInt(data.SHOW || '0', 10); // SHOW 可能是总数或当前显示数

            items = albumlist.map(item => ({
                id: String(item.albumid || item.id),
                title: cleanText(item.name),
                author: '', // 酷我未直接返回独立的作者字段，有时混在 info 或 artist 中
                cover_url: item.hts_img || item.img || null, // 封面，直接使用，不需要处理 referer
                intro: item.info || '',
                tags: [],
                narrator: item.aartist || item.artist || item.fartist || null,
                chapter_count: parseInt(item.musiccnt || '0', 10),
                duration: null
            }));
        }

        // 演播者筛选与重排
        if (narratorFilter && items.length > 0) {
            const normalizedFilter = narratorFilter.trim().toLowerCase();
            const index = items.findIndex(item => {
                const itemNarrator = (item.narrator || '').trim().toLowerCase();
                return itemNarrator && (itemNarrator.includes(normalizedFilter) || normalizedFilter.includes(itemNarrator));
            });

            if (index > -1) {
                Ting.log.info(`找到匹配演播的结果: ${items[index].narrator}`);
                const [match] = items.splice(index, 1);
                items.unshift(match);
            } else {
                Ting.log.info(`未找到匹配演播 "${narratorFilter}" 的结果`);
            }
        }

        return {
            items: items,
            total: total || items.length,
            page: page,
            page_size: items.length
        };
    } catch (error) {
        Ting.log.error(`酷我听书搜索失败: ${error.message}`);
        throw error;
    }
}

// 导出函数
globalThis.initialize = initialize;
globalThis.shutdown = shutdown;
globalThis.search = search;