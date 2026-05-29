// 北北基桃火車站周邊景點資料

export const AREAS = [
  { id: 'taipei',   name: '台北市' },
  { id: 'newTaipei', name: '新北市' },
  { id: 'keelung',  name: '基隆市' },
  { id: 'taoyuan',  name: '桃園市' },
];

export const TYPE_ICONS = {
  museum:     '🏛️',
  park:       '🌳',
  temple:     '⛩️',
  nightmarket:'🌙',
  shopping:   '🛍️',
  historic:   '🏯',
  nature:     '🌿',
  art:        '🎨',
  food:       '🍜',
  scenic:     '⛰️',
  activity:   '🎭',
  transport:  '🚌',
  other:      '📍',
};

export const TYPE_NAMES = {
  museum:     '博物館',
  park:       '公園',
  temple:     '廟宇',
  nightmarket:'夜市',
  shopping:   '購物',
  historic:   '歷史古蹟',
  nature:     '自然景觀',
  art:        '藝文場所',
  food:       '美食',
  scenic:     '風景點',
  activity:   '活動',
  transport:  '交通',
  other:      '其他',
};

export const ITEM_TYPES = [
  { value: 'attraction', label: '景點', icon: '🗺️' },
  { value: 'food',       label: '餐廳/美食', icon: '🍜' },
  { value: 'activity',   label: '活動', icon: '🎭' },
  { value: 'transport',  label: '交通', icon: '🚌' },
  { value: 'other',      label: '其他', icon: '📍' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'food',          label: '餐飲', icon: '🍜' },
  { value: 'transport',     label: '交通', icon: '🚌' },
  { value: 'accommodation', label: '住宿', icon: '🏨' },
  { value: 'attraction',    label: '景點門票', icon: '🎫' },
  { value: 'shopping',      label: '購物', icon: '🛍️' },
  { value: 'other',         label: '其他', icon: '📦' },
];

export const STATUS_OPTIONS = [
  { value: 'planned',     label: '已規劃',  color: '#16a34a' },
  { value: 'unplanned',   label: '未規劃',  color: '#64748b' },
  { value: 'completed',   label: '已完成',  color: '#7c3aed' },
  { value: 'uncompleted', label: '未完成',  color: '#dc2626' },
];

export const STATIONS = {
  taipei: [
    {
      id: 'sta-tp-01',
      name: '台北車站',
      attractions: [
        { id: 'attr-tp01-01', name: '台灣博物館',     type: 'museum',   distance: 300, address: '台北市中正區襄陽路2號' },
        { id: 'attr-tp01-02', name: '二二八和平公園', type: 'park',     distance: 350, address: '台北市中正區凱達格蘭大道3號' },
        { id: 'attr-tp01-03', name: '西門町',         type: 'shopping', distance: 850, address: '台北市萬華區西門町' },
        { id: 'attr-tp01-04', name: '北門（承恩門）', type: 'historic', distance: 250, address: '台北市中正區忠孝西路一段' },
        { id: 'attr-tp01-05', name: '台北地下街',     type: 'shopping', distance: 100, address: '台北市中正區忠孝西路一段' },
        { id: 'attr-tp01-06', name: '中山地下街',     type: 'shopping', distance: 600, address: '台北市中正區中山北路一段' },
      ],
    },
    {
      id: 'sta-tp-02',
      name: '松山車站',
      attractions: [
        { id: 'attr-tp02-01', name: '饒河街夜市',     type: 'nightmarket', distance: 200, address: '台北市松山區饒河街' },
        { id: 'attr-tp02-02', name: '松山文創園區',   type: 'art',         distance: 350, address: '台北市信義區光復南路133號' },
        { id: 'attr-tp02-03', name: '慈祐宮',         type: 'temple',      distance: 150, address: '台北市松山區八德路四段761號' },
        { id: 'attr-tp02-04', name: '松山機場（觀景台）', type: 'scenic',   distance: 700, address: '台北市松山區敦化北路340-9號' },
      ],
    },
    {
      id: 'sta-tp-03',
      name: '萬華車站',
      attractions: [
        { id: 'attr-tp03-01', name: '龍山寺',         type: 'temple',  distance: 350, address: '台北市萬華區廣州街211號' },
        { id: 'attr-tp03-02', name: '艋舺公園（夜市）', type: 'nightmarket', distance: 500, address: '台北市萬華區西園路一段' },
        { id: 'attr-tp03-03', name: '剝皮寮歷史街區', type: 'historic', distance: 400, address: '台北市萬華區廣州街101號' },
        { id: 'attr-tp03-04', name: '青草巷',         type: 'shopping', distance: 450, address: '台北市萬華區西昌街' },
      ],
    },
    {
      id: 'sta-tp-04',
      name: '南港車站',
      attractions: [
        { id: 'attr-tp04-01', name: '南港展覽館',     type: 'activity', distance: 400, address: '台北市南港區經貿二路1號' },
        { id: 'attr-tp04-02', name: '南港公園',       type: 'park',     distance: 600, address: '台北市南港區市民大道八段' },
        { id: 'attr-tp04-03', name: '中研院（院史文物館）', type: 'museum', distance: 950, address: '台北市南港區研究院路二段128號' },
      ],
    },
  ],
  newTaipei: [
    {
      id: 'sta-nt-01',
      name: '板橋車站',
      attractions: [
        { id: 'attr-nt01-01', name: '林家花園（板橋林本源園邸）', type: 'historic', distance: 400, address: '新北市板橋區西門街9號' },
        { id: 'attr-nt01-02', name: '板橋435藝文特區', type: 'art',     distance: 600, address: '新北市板橋區中山路一段435號' },
        { id: 'attr-nt01-03', name: '府中商圈',        type: 'shopping', distance: 300, address: '新北市板橋區府中路' },
        { id: 'attr-nt01-04', name: '新埔公園',        type: 'park',     distance: 800, address: '新北市板橋區文化路一段' },
      ],
    },
    {
      id: 'sta-nt-02',
      name: '樹林車站',
      attractions: [
        { id: 'attr-nt02-01', name: '樹林老街',        type: 'historic', distance: 350, address: '新北市樹林區保安街' },
        { id: 'attr-nt02-02', name: '彭厝濕地公園',    type: 'nature',   distance: 700, address: '新北市樹林區彭厝里' },
      ],
    },
    {
      id: 'sta-nt-03',
      name: '汐止車站',
      attractions: [
        { id: 'attr-nt03-01', name: '汐止老街',        type: 'historic', distance: 400, address: '新北市汐止區大同路一段' },
        { id: 'attr-nt03-02', name: '新山夢湖',        type: 'nature',   distance: 900, address: '新北市汐止區新山里' },
        { id: 'attr-nt03-03', name: '拱北殿',          type: 'temple',   distance: 700, address: '新北市汐止區拱北里' },
      ],
    },
    {
      id: 'sta-nt-04',
      name: '瑞芳車站',
      attractions: [
        { id: 'attr-nt04-01', name: '九份老街',        type: 'historic', distance: 600, address: '新北市瑞芳區九份山城' },
        { id: 'attr-nt04-02', name: '侯硐貓村',        type: 'scenic',   distance: 500, address: '新北市瑞芳區侯硐里' },
        { id: 'attr-nt04-03', name: '黃金瀑布',        type: 'nature',   distance: 800, address: '新北市瑞芳區水湳洞' },
      ],
    },
    {
      id: 'sta-nt-05',
      name: '三重車站',
      attractions: [
        { id: 'attr-nt05-01', name: '先嗇宮',          type: 'temple',   distance: 400, address: '新北市三重區正義南路' },
        { id: 'attr-nt05-02', name: '三重商業區',      type: 'shopping', distance: 300, address: '新北市三重區重新路' },
        { id: 'attr-nt05-03', name: '三重運動公園',    type: 'park',     distance: 600, address: '新北市三重區重陽路四段' },
      ],
    },
    {
      id: 'sta-nt-06',
      name: '新莊車站',
      attractions: [
        { id: 'attr-nt06-01', name: '新莊老街',        type: 'historic', distance: 300, address: '新北市新莊區新莊路' },
        { id: 'attr-nt06-02', name: '武聖廟',          type: 'temple',   distance: 350, address: '新北市新莊區新莊路341號' },
        { id: 'attr-nt06-03', name: '新莊棒球場',      type: 'activity', distance: 500, address: '新北市新莊區中正路' },
      ],
    },
  ],
  keelung: [
    {
      id: 'sta-kl-01',
      name: '基隆車站',
      attractions: [
        { id: 'attr-kl01-01', name: '廟口夜市',        type: 'nightmarket', distance: 500, address: '基隆市仁愛區愛四路' },
        { id: 'attr-kl01-02', name: '基隆港',          type: 'scenic',      distance: 200, address: '基隆市中正區港西街' },
        { id: 'attr-kl01-03', name: '基隆市立文化中心', type: 'art',         distance: 350, address: '基隆市信義區信一路181號' },
        { id: 'attr-kl01-04', name: '中正公園',        type: 'park',        distance: 700, address: '基隆市中正區中正路' },
        { id: 'attr-kl01-05', name: '奠濟宮（廟口廟）', type: 'temple',     distance: 500, address: '基隆市仁愛區忠一路99號' },
      ],
    },
    {
      id: 'sta-kl-02',
      name: '八堵車站',
      attractions: [
        { id: 'attr-kl02-01', name: '八堵火車站（百年車站）', type: 'historic', distance: 100, address: '基隆市暖暖區八堵里' },
        { id: 'attr-kl02-02', name: '暖暖親水公園',    type: 'park',     distance: 500, address: '基隆市暖暖區暖江里' },
      ],
    },
  ],
  taoyuan: [
    {
      id: 'sta-ty-01',
      name: '桃園車站',
      attractions: [
        { id: 'attr-ty01-01', name: '桃園神社',        type: 'historic', distance: 800, address: '桃園市桃園區成功路三段200號' },
        { id: 'attr-ty01-02', name: '桃園老街',        type: 'historic', distance: 600, address: '桃園市桃園區中正路' },
        { id: 'attr-ty01-03', name: '正大武廟',        type: 'temple',   distance: 400, address: '桃園市桃園區中山路' },
        { id: 'attr-ty01-04', name: '桃園市立圖書館總館', type: 'art',   distance: 700, address: '桃園市桃園區縣府路21號' },
      ],
    },
    {
      id: 'sta-ty-02',
      name: '中壢車站',
      attractions: [
        { id: 'attr-ty02-01', name: '中壢夜市',        type: 'nightmarket', distance: 300, address: '桃園市中壢區延平路' },
        { id: 'attr-ty02-02', name: '老街溪河濱公園',  type: 'park',        distance: 500, address: '桃園市中壢區老街溪旁' },
        { id: 'attr-ty02-03', name: '中壢藝術館',      type: 'art',         distance: 600, address: '桃園市中壢區環中東路一段728號' },
        { id: 'attr-ty02-04', name: '仁海宮',          type: 'temple',      distance: 400, address: '桃園市中壢區仁愛路99號' },
      ],
    },
    {
      id: 'sta-ty-03',
      name: '楊梅車站',
      attractions: [
        { id: 'attr-ty03-01', name: '楊梅老街',        type: 'historic', distance: 400, address: '桃園市楊梅區中山北路' },
        { id: 'attr-ty03-02', name: '楊梅埔心牧場（附近）', type: 'nature', distance: 900, address: '桃園市楊梅區埔心里' },
      ],
    },
    {
      id: 'sta-ty-04',
      name: '平鎮車站',
      attractions: [
        { id: 'attr-ty04-01', name: '宋屋綠色隧道',    type: 'nature',   distance: 800, address: '桃園市平鎮區宋屋里' },
        { id: 'attr-ty04-02', name: '平鎮褒忠義民廟',  type: 'temple',   distance: 500, address: '桃園市平鎮區義民路一段118號' },
      ],
    },
    {
      id: 'sta-ty-05',
      name: '富岡車站',
      attractions: [
        { id: 'attr-ty05-01', name: '富岡老街',        type: 'historic', distance: 300, address: '桃園市楊梅區富岡里' },
        { id: 'attr-ty05-02', name: '高榮里紫薇花園',  type: 'nature',   distance: 600, address: '桃園市楊梅區高榮里' },
      ],
    },
  ],
};

export function getStationsByArea(areaId) {
  return STATIONS[areaId] || [];
}

export function getStationById(stationId) {
  for (const area of Object.values(STATIONS)) {
    const station = area.find(s => s.id === stationId);
    if (station) return station;
  }
  return null;
}

export function getAttractionById(stationId, attractionId) {
  const station = getStationById(stationId);
  if (!station) return null;
  return station.attractions.find(a => a.id === attractionId) || null;
}
