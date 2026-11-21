// Starting content. Everything here can be changed from the Admin panel.
export const DEFAULT_SETTINGS = {
  company_name: 'AYSAH INDUSTRIES LTD',
  tagline_rw: "Imodoka z'ubwoko bwose",
  tagline_en: 'Vehicles of every type',
  logo_url: './images/logo.png',
  favicon_url: './favicon.png',
  owner_name: 'MUTABAZI Yves',
  email: 'aysah22n@gmail.com',
  phone: '+250 784 578 722',
  whatsapp: '250784578722',
  address: 'Kigali, Rwanda',
  opening_hours: 'Mon – Sat, 8:00 – 18:00',
  // Any Google Maps "Embed a map" link, or leave the address and we build one.
  map_embed_url: 'https://www.google.com/maps?q=Kigali%2C%20Rwanda&output=embed',
  about_title_rw: 'Turi bande?',
  about_title_en: 'Who we are',
  about_text_rw:
    "AYSAH INDUSTRIES LTD ni ikigo cyo mu Rwanda gicuruza imodoka z'ubwoko butandukanye: imodoka nto z'abantu ku giti cyabo, amakamyo manini, amakamyo y'ibitaka (dump trucks), za remorque n'ibikoresho byazo. Tugufasha guhitamo imodoka ikubereye, kuyigeza aho uri no kuyitaho nyuma yo kuyigura.",
  about_text_en:
    'AYSAH INDUSTRIES LTD is a Rwandan company selling vehicles of every type: personal cars, heavy trucks, dump trucks, trailers and their equipment. We help you choose the right vehicle, deliver it to you and support you after the sale.',
  mission_rw: "Kugeza ku Banyarwanda imodoka zizewe ku giciro gikwiye, kandi bakishyura mu buryo bworoshye ukoresheje Pi.",
  mission_en: 'To bring reliable vehicles to our clients at a fair price, with simple payment in Pi.',
  vision_rw: "Kuba ikigo cya mbere mu karere mu bucuruzi bw'imodoka bukoresha ikoranabuhanga.",
  vision_en: 'To be the leading technology-driven vehicle dealer in the region.',
  about_image: './images/actros-container.jpg',
  footer_text_rw: "Imodoka z'ubwoko bwose, amakamyo n'ibikoresho byazo.",
  footer_text_en: 'Vehicles of every type, trucks and their equipment.',
  facebook: '',
  instagram: '',
  primary_color: '#111827',
  accent_color: '#E3A33D',
}

export const SEED = {
  slides: [
    { id: 's1', sort: 1, image_url: './images/actros-front.jpg', title_rw: 'Imodoka zizewe.', title2_rw: 'Ibiciro bisobanutse.', title_en: 'Reliable vehicles.', title2_en: 'Clear prices.', text_rw: "Hitamo imodoka ikubereye muri AYSAH INDUSTRIES, wishyure ukoresheje Pi.", text_en: 'Choose the right vehicle at AYSAH INDUSTRIES and pay with Pi.', active: true },
    { id: 's2', sort: 2, image_url: './images/dump-trucks.jpg', title_rw: 'Amakamyo mashya', title2_rw: 'ageze mu Rwanda.', title_en: 'New trucks', title2_en: 'arriving in Rwanda.', text_rw: "Dump trucks na za kamyo z'imirimo itandukanye.", text_en: 'Dump trucks and work trucks for every job.', active: true },
    { id: 's3', sort: 3, image_url: './images/g-class.jpg', title_rw: 'Imodoka nziza', title2_rw: "z'abantu ku giti cyabo.", title_en: 'Premium cars', title2_en: 'for personal use.', text_rw: 'SUV, imodoka nto n’iz’akazi.', text_en: 'SUVs, city cars and business cars.', active: true },
  ],
  products: [
    { id: 'p1', kind: 'product', category: 'SUV', name: 'Mercedes-Benz G-Class', description_rw: "SUV y'umukara, imeze neza cyane, ifite amapine mashya.", description_en: 'Black luxury SUV in excellent condition with new tyres.', price_pi: 250, image_url: './images/g-class.jpg', available: true, featured: true },
    { id: 'p2', kind: 'product', category: 'Dump truck', name: 'Sinotruk HOWO Dump Truck', description_rw: "Kamyo y'ibitaka nshya, ikwiriye imirimo y'ubwubatsi.", description_en: 'New dump truck for construction work.', price_pi: 180, image_url: './images/dump-trucks.jpg', available: true, featured: true },
    { id: 'p3', kind: 'product', category: 'Truck', name: 'Mercedes-Benz Actros + Container', description_rw: "Kamyo nini ifite container yo gutwara ibicuruzwa (transit goods).", description_en: 'Heavy truck with cargo container for transit goods.', price_pi: 300, image_url: './images/actros-container.jpg', available: true, featured: true },
    { id: 'p4', kind: 'product', category: 'Trailer', name: 'Container Trailer (Orange)', description_rw: 'Remorque ifite container, yiteguye gukoreshwa.', description_en: 'Container trailer, ready for use.', price_pi: 120, image_url: './images/trailer-orange.jpg', available: true, featured: false },
    { id: 'p5', kind: 'service', category: 'Import', name:'Vehicle import on order', description_rw: 'Tukuzanira imodoka wahisemo, tugakurikirana gasutamo kugeza igeze iwawe.', description_en: 'We import the vehicle you choose and handle customs until delivery.', price_pi: 0, image_url: './images/dump-trucks.jpg', available: true, featured: false },
    { id: 'p6', kind: 'service', category: 'Assembly', name: 'Truck body & container assembly', description_rw: 'Duteranya container, citerne na carrosserie ku makamyo.', description_en: 'We assemble containers, tanks and truck bodies.', price_pi: 0, image_url: './images/actros-front.jpg', available: true, featured: false },
  ],
  team: [
    { id: 't1', sort: 1, name: 'MUTABAZI Yves', role_rw: 'Nyiri ikigo & Umuyobozi Mukuru', role_en: 'Owner & Managing Director', photo_url: '', bio_rw: "Ayobora AYSAH INDUSTRIES LTD n'ubucuruzi bwayo bwose.", bio_en: 'Leads AYSAH INDUSTRIES LTD and all of its business.', email: 'aysah22n@gmail.com', phone: '+250 784 578 722' },
  ],
}

export const ADMIN_EMAIL = 'aysah22n@gmail.com'
