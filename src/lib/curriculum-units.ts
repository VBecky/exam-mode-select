// Ethiopian Grade 9–12 curriculum units per subject, plus a keyword
// classifier that sorts REAL paper questions of a given year into units.
// No questions are invented here: each unit only shows questions taken from
// that year's exam paper whose content matches the unit's keywords.

import type { Question } from "./exam-questions";

// [title, extra keywords (comma separated)]
type U = [string, string];
type Curriculum = Record<number, U[]>; // grade -> units

const MATH: Curriculum = {
  9: [
    ["Further on Sets", "set,subset,union,intersection,complement,venn,element,empty set,universal"],
    ["The Number System", "rational,irrational,real number,integer,prime,gcd,lcm,decimal,surd,radical,sqrt,square root,divisible"],
    ["Solving Equations", "equation,solve,solution set,quadratic equation,linear equation,system of"],
    ["Solving Inequalities", "inequality,inequalities,interval,absolute value,≤,≥,\\le,\\ge"],
    ["Introduction to Trigonometry", "right triangle,hypotenuse,angle of elevation,angle of depression"],
    ["Regular Polygons", "polygon,pentagon,hexagon,octagon,interior angle,exterior angle,apothem"],
    ["Congruency and Similarity", "congruent,similar,similarity,ratio of areas,scale factor"],
    ["Vectors in Two Dimensions", "vector,magnitude,displacement"],
    ["Statistics and Probability", "frequency,histogram,pie chart"],
  ],
  10: [
    ["Relations and Functions", "relation,domain,range,inverse function,composition"],
    ["Polynomial Functions", "polynomial,degree,remainder,factor theorem,zeros,leading coefficient"],
    ["Exponential and Logarithmic Functions", "exponential,logarithm,log,\\log,ln,e^,base"],
    ["Trigonometric Functions", "sin,cos,tan,\\sin,\\cos,\\tan,radian,period,amplitude,trigonometric,cot,sec"],
    ["Circles", "circle,chord,tangent line,arc,sector,radius,diameter,inscribed"],
    ["Solid Figures", "cone,cylinder,sphere,prism,pyramid,volume,surface area,frustum"],
    ["Coordinate Geometry", "slope,line,midpoint,distance between,coordinate,perpendicular,parallel,y-intercept"],
  ],
  11: [
    ["Relations and Functions", "one-to-one,onto,piecewise,greatest integer,floor"],
    ["Rational Expressions and Rational Functions", "rational function,rational expression,asymptote,partial fraction"],
    ["Matrices", "matrix,matrices,transpose,row,column"],
    ["Determinants and their Properties", "determinant,det,cramer,inverse of a matrix,singular"],
    ["Vectors", "dot product,scalar product,unit vector,orthogonal,projection"],
    ["Transformations of the Plane", "transformation,reflection,rotation,translation,dilation,image of"],
    ["Statistics", "mean,median,mode,variance,standard deviation,quartile,data"],
    ["Probability", "probability,permutation,combination,event,sample space,dice,coin,random"],
  ],
  12: [
    ["Sequence and Series", "sequence,series,arithmetic,geometric,common ratio,common difference,sum of the first,nth term,\\sum,convergent,infinite"],
    ["Introduction to Calculus", "limit,lim,\\lim,derivative,differentiat,integral,\\int,continuous,maximum,minimum,f'(,tangent to the curve,rate of change"],
    ["Statistics", "sampling,sample,population,correlation,regression,grouped data"],
    ["Introduction to Linear Programming", "linear programming,objective function,constraint,feasible region,maximize,minimize"],
    ["Mathematical Application in Business", "interest,compound,simple interest,profit,loss,discount,depreciation,annuity,tax,birr,investment,percent"],
  ],
};

const CHEM: Curriculum = {
  9: [
    ["Chemistry and Its Importance", "importance of chemistry,branch of chemistry"],
    ["Measurements and Scientific Methods", "measurement,significant figure,scientific method,si unit,hypothesis,precision,accuracy"],
    ["Structure of the Atom", "proton,neutron,electron,isotope,atomic number,mass number,nucleus,orbital,quantum,electron configuration"],
    ["Periodic Classification of Elements", "periodic table,period,group,ionization energy,electronegativity,atomic radius,halogen,noble gas,alkali"],
    ["Chemical Bonding", "ionic bond,covalent,metallic bond,lewis,hybridization,vsepr,polar,intermolecular,hydrogen bond"],
  ],
  10: [
    ["Chemical Reactions and Stoichiometry", "mole,stoichiometry,limiting reagent,balanced,molar mass,yield,reaction type"],
    ["Solutions", "solution,solute,solvent,molarity,molality,concentration,solubility,dilution"],
    ["Important Inorganic Compounds", "oxide,acid,base,salt,indicator,neutralization"],
    ["Energy Changes and Electrochemistry", "enthalpy,exothermic,endothermic,heat of,energy change"],
    ["Metals and Non-metals", "metal,non-metal,nonmetal,alloy,ore,corrosion"],
    ["Hydrocarbons and Their Natural Sources", "alkane,alkene,alkyne,hydrocarbon,petroleum,methane,ethene,benzene,isomer,natural gas"],
  ],
  11: [
    ["Atomic Structure and Periodic Properties of the Elements", "quantum number,aufbau,hund,pauli,effective nuclear"],
    ["Chemical Bonding", "molecular geometry,bond angle,sigma,pi bond,molecular orbital"],
    ["Physical State of Matter", "gas law,pressure,volume,temperature,boyle,charles,ideal gas,liquid,solid,vapor pressure,crystal"],
    ["Chemical Kinetics", "rate of reaction,rate law,activation energy,catalyst,order of reaction,half-life,rate constant"],
    ["Chemical Equilibrium", "equilibrium,le chatelier,kc,kp,equilibrium constant,reversible"],
    ["Some Important Oxygen-containing Organic Compounds", "alcohol,aldehyde,ketone,carboxylic,ester,ether,ethanol,functional group"],
  ],
  12: [
    ["Acid-Base Equilibrium", "ph,poh,ka,kb,buffer,titration,conjugate,bronsted,lewis acid,hydrolysis,weak acid,strong acid"],
    ["Electrochemistry", "electrolysis,electrode,anode,cathode,galvanic,voltaic,oxidation,reduction,redox,cell potential,faraday,emf"],
    ["Industrial Chemistry", "industrial,haber,contact process,fertilizer,cement,soap,detergent,sugar,paper,tanning"],
    ["Polymers", "polymer,monomer,polymerization,plastic,rubber,nylon,polyethylene,protein,addition polymer,condensation polymer"],
    ["Introduction to Environmental Chemistry", "pollution,pollutant,greenhouse,ozone,acid rain,environment,water treatment,smog"],
  ],
};

const BIO: Curriculum = {
  9: [
    ["Introduction to Biology", "scientific method,microscope,branches of biology"],
    ["Characteristics and Classification of Organisms", "classification,kingdom,taxonomy,binomial,species,genus,phylum"],
    ["Cells", "cell,organelle,mitochondria,nucleus,membrane,chloroplast,ribosome,osmosis,diffusion"],
    ["Reproduction", "reproduction,asexual,sexual,pollination,fertilization,gamete,menstrual"],
    ["Human Health, Nutrition and Disease", "nutrition,vitamin,disease,malaria,hiv,aids,deficiency,balanced diet,tuberculosis"],
    ["Ecology", "ecosystem,food chain,food web,habitat,biome,producer,consumer"],
  ],
  10: [
    ["Sub-fields of Biology", "sub-field,botany,zoology,microbiology,genetics field"],
    ["Plants", "plant,root,stem,leaf,xylem,phloem,transpiration,stomata"],
    ["Biochemical Molecules", "carbohydrate,protein,lipid,nucleic acid,amino acid,glucose,starch,biochemical"],
    ["Cell Reproduction", "mitosis,meiosis,cell cycle,chromosome,interphase,prophase,metaphase,anaphase,telophase"],
    ["Human Biology", "digestive,circulatory,respiratory,heart,blood"],
    ["Ecological Interaction", "symbiosis,mutualism,parasitism,commensalism,competition,predation"],
  ],
  11: [
    ["Biology and Technology", "biotechnology,genetic engineering,cloning,recombinant,gmo,pcr"],
    ["Characteristics of Animals", "vertebrate,invertebrate,mammal,reptile,amphibian,insect,arthropod,chordate"],
    ["Enzymes", "enzyme,substrate,active site,inhibitor,denature,catalyst"],
    ["Genetics", "gene,allele,dominant,recessive,mendel,genotype,phenotype,heterozygous,homozygous,dna,inheritance,cross,linkage,mutation"],
    ["The Human Body Systems", "nervous,endocrine,hormone,skeletal,muscle,neuron"],
    ["Population and Natural Resources", "population,carrying capacity,growth rate,natural resource,conservation,biodiversity"],
  ],
  12: [
    ["Application of Biology", "application,fermentation,vaccine,agriculture,forensic"],
    ["Microorganisms", "bacteria,virus,fungi,protozoa,microorganism,pathogen,antibiotic"],
    ["Energy Transformation", "photosynthesis,respiration,atp,glycolysis,krebs,electron transport,calvin,fermentation"],
    ["Evolution", "evolution,natural selection,darwin,lamarck,fossil,speciation,adaptation,homologous"],
    ["Human Body System", "excretion,kidney,nephron,immune,antibody,lymph,homeostasis"],
    ["Climate Change", "climate change,global warming,greenhouse,carbon dioxide emission"],
  ],
};

const PHYS: Curriculum = {
  9: [
    ["Physics and Human Society", "branches of physics,physics and"],
    ["Physical Quantities", "physical quantity,dimension,si unit,base unit,derived unit,measurement,significant"],
    ["Motion in a Straight Line", "speed,velocity,straight line,displacement,distance-time"],
    ["Force", "force,newton,friction,inertia,mass,weight"],
    ["Work, Energy and Power", "work,energy,power,kinetic,potential,joule,watt"],
    ["Simple Machines", "lever,pulley,inclined plane,mechanical advantage,efficiency,velocity ratio,machine"],
    ["Mechanical Oscillation and Sound Wave", "oscillation,pendulum,sound,frequency,wave,amplitude,echo,resonance"],
    ["Temperature and Thermometer", "temperature,thermometer,celsius,kelvin,fahrenheit"],
  ],
  10: [
    ["Vector Quantities", "vector,resultant,component,scalar"],
    ["Uniformly Accelerated Motion", "acceleration,free fall,uniformly accelerated,deceleration"],
    ["Elasticity and Static Equilibrium of Rigid Body", "elastic,hooke,stress,strain,young,torque,equilibrium,moment,center of gravity"],
    ["Static and Current Electricity", "charge,current,resistance,ohm,voltage,resistor,circuit,coulomb"],
    ["Magnetism", "magnet,magnetic,pole,compass"],
    ["Electromagnetic Waves and Geometrical Optics", "light,mirror,lens,refraction,reflection,focal,image,electromagnetic wave,spectrum"],
  ],
  11: [
    ["Physics and Human Society", "scientific method,physics in"],
    ["Vectors", "dot product,cross product,unit vector"],
    ["Motion in One and Two Dimensions", "relative velocity,circular motion,centripetal"],
    ["Dynamics", "momentum,impulse,collision,newton's law,conservation of momentum"],
    ["Heat Conduction and Calorimetry", "heat,specific heat,latent heat,calorimeter,conduction,convection,radiation,thermal expansion"],
    ["Electrostatics and Electric Circuit", "electric field,capacitor,capacitance,potential difference,kirchhoff,emf,electrostatic"],
    ["Nuclear Physics", "nucleus,radioactive,half-life,alpha,beta,gamma,fission,fusion,isotope,nuclear"],
  ],
  12: [
    ["Application of Physics in Other Fields", "medical,x-ray,mri,ultrasound,application,archaeology"],
    ["Two-dimensional Motion", "projectile,range,maximum height,horizontal,trajectory,angular,rotational,satellite,orbit,gravitation"],
    ["Fluid Mechanics", "fluid,pressure,density,buoyan,archimedes,pascal,bernoulli,viscosity,flow rate,float"],
    ["Electromagnetism", "electromagnetic induction,faraday,lenz,solenoid,transformer,generator,magnetic flux,motor"],
    ["Basics of Electronics", "semiconductor,diode,transistor,logic gate,and gate,or gate,rectifier,p-n,doping"],
  ],
};

const hist = (s: string): U[] => s.split(";").map((t) => [t.trim(), ""]);
const HISTORY: Curriculum = {
  9: hist("The Discipline of History and Human Evolution; Ancient World Civilizations up to c. 500 AD; Peoples and States in Ethiopia and the Horn to the End of the 13th Century; The Middle Ages and Early Modern World, c. 500 to 1750s; Peoples and States of Africa to 1500; Africa and the Outside World 1500–1880s; States, Principalities, Population Movements and Interactions in Ethiopia, 13th to Mid-16th C.; Political, Social and Economic Processes in Ethiopia, Mid-16th to Mid-19th C.; The Age of Revolutions 1750s to 1815"),
  10: hist("Development of Capitalism and Nationalism 1815–1914; Africa and the Colonial Experience (1880s–1960s); Social, Economic and Political Developments in Ethiopia, Mid-19th C. to 1941; Society and Politics in the Age of World Wars 1914–1945; Global and Regional Developments Since 1945; Ethiopia: Internal Developments and External Influences 1941–1991; Africa Since 1960; Post-1991 Developments in Ethiopia; Indigenous Knowledge and Heritages of Ethiopia"),
  11: hist("History, Historiography and Human Evolution; Major Spots of Ancient World Civilizations up to c. 500 AD; Peoples, States and Historical Processes in Ethiopia and the Horn to the End of the 13th Century; The Middle Ages and Early Modern World, c. 500 AD–1789; Peoples and States of Africa to 1500; Africa and the Outside World 1500–1880; States, Principalities, Population Movements and Interactions in Ethiopia; Political, Social and Economic Processes in Ethiopia, Mid-16th to Mid-19th Century; The Age of Revolutions 1789 to 1815"),
  12: hist("Development of Capitalism and Nationalism 1815–1914; Africa and the Colonial Experience (1880s–1960s); Social, Economic and Political Developments in Ethiopia, Mid-19th C. to 1941; Society and Politics in the Age of World Wars 1914–1945; Global and Regional Developments Since 1945; Ethiopia: Internal Developments and External Influences 1941–1991; Africa Since the 1960s; Post-1991 Developments in Ethiopia; Indigenous Knowledge Systems and Heritages of Ethiopia"),
};
// History keywords by unit index (shared across grade pairs 9/11 and 10/12)
const HIST_KW_A = [
  "historiography,source,evolution,hominid,lucy,australopithecus,homo,stone age,prehistor",
  "egypt,mesopotamia,greece,rome,roman,greek,china,india,indus,civilization,pharaoh,sumer",
  "aksum,axum,punt,d'mt,zagwe,lalibela,yeha,horn",
  "middle ages,feudal,medieval,renaissance,reformation,crusade,islam,byzantine",
  "ghana,mali,songhai,zimbabwe,kongo,kush,meroe,swahili,bantu",
  "slave trade,portuguese,explorer,trans-atlantic,scramble",
  "solomonic,amde tsion,zara yaqob,adal,ahmad,gragn,sultanate,oromo,population movement,shewa",
  "gondar,zemene mesafint,fasilides,susenyos,jesuit,era of princes",
  "french revolution,american revolution,industrial revolution,napoleon,enlightenment",
];
const HIST_KW_B = [
  "capitalism,nationalism,unification,italy,germany,bismarck,imperialism",
  "colonial,colonialism,berlin conference,scramble,indirect rule,assimilation,independence movement",
  "tewodros,yohannes,menelik,adwa,lij iyasu,haile selassie,italian occupation,1935,1896",
  "world war,versailles,league of nations,fascism,nazi,hitler,mussolini,great depression",
  "cold war,united nations,nato,warsaw,decolonization,non-aligned",
  "derg,mengistu,1974,revolution,eritrea federation,land reform,emperor haile",
  "oau,african union,pan-african,apartheid,nkrumah,africa since",
  "eprdf,1991,federalism,constitution of 1995,post-1991,ethnic federal",
  "indigenous,heritage,gada,unesco,world heritage,tradition",
];

const econ = (s: string, kw: string[]): U[] => s.split(";").map((t, i) => [t.trim(), kw[i] ?? ""]);
const ECON: Curriculum = {
  9: econ("Introducing Economics; The Basic Economic Problems and Economic Systems; Economic Resources and Markets; Introduction to Demand and Supply; Introduction to Production and Cost; Introduction to Money; Introduction to Macroeconomics; Basic Entrepreneurship",
    ["scarcity,economics,microeconomics,positive,normative","economic system,command,mixed economy,what to produce,opportunity cost,ppf,production possibility","resource,land,labour,labor,capital,market","demand,supply,law of demand,equilibrium price","production,cost,fixed cost,variable cost,output","money,barter,medium of exchange,store of value","macroeconomics,gdp,inflation,unemployment","entrepreneur,business plan"]),
  10: econ("Theory of Consumer Behaviour; Theories of Demand and Supply; Theories of Production and Cost; Market Structure; Banking and Finance; Economic Growth; The Ethiopian Economy; Business Startups and Innovation",
    ["utility,consumer,indifference,budget line,marginal utility","elasticity,shift,shortage,surplus","marginal product,average cost,marginal cost,diminishing returns,short run,long run","perfect competition,monopoly,oligopoly,monopolistic","bank,central bank,interest rate,credit,deposit,loan","economic growth,growth rate,per capita","ethiopia,ethiopian economy,agriculture","startup,innovation,venture"]),
  11: econ("Theory of Consumer Behavior and Demand; Market Structure and the Decision of Firms; National Income Accounting; Consumption, Saving and Investment; Trade and Finance; Economic Development; Main Sectors, Sectoral Policies and Strategies of Ethiopia",
    ["consumer surplus,demand curve,utility maximization","firm,profit maximization,mr=mc,price taker","gnp,gdp,national income,value added,expenditure approach,income approach","consumption,saving,investment,mpc,mps,multiplier","trade,export,import,exchange rate,balance of payment,tariff,comparative advantage","development,hdi,human development,underdevelopment","sector,industrial policy,adli,agricultural policy"]),
  12: econ("The Fundamental Concepts of Macroeconomics; Aggregate Demand and Aggregate Supply Analysis; Market Failure and Consumer Protection; Macroeconomic Policy Instruments; Tax Theory and Practice; Poverty and Inequality; Macroeconomic Reforms in Ethiopia; Economy, Environment and Climate Change",
    ["macroeconomic goal,business cycle,inflation,unemployment","aggregate demand,aggregate supply,ad,as curve","market failure,externality,public good,consumer protection,asymmetric","fiscal policy,monetary policy,open market,reserve requirement","tax,progressive,regressive,proportional,vat,direct tax,indirect tax","poverty,inequality,gini,lorenz","reform,structural adjustment,privatization,gtp","environment,climate change,green economy,sustainable"]),
};

const geo = (s: string, kw: string[]): U[] => s.split(";").map((t, i) => [t.trim(), kw[i] ?? ""]);
const GEO_KW = [
  "geolog,rock,rift valley,highland,plateau,landform,topography,mountain,era,precambrian,tectonic",
  "climate,rainfall,temperature,season,kiremt,belg,bega,wind,itcz",
  "resource,soil,water,forest,mineral,wildlife,drainage,river,lake",
  "population,census,birth rate,death rate,fertility,migration,urban,density,demographic",
  "agriculture,economic activit,industry,tourism,culture,pastoral,trade,transport",
  "degradation,deforestation,erosion,desertification,drought,human-environment,interaction",
  "issue,concern,hiv,gender,conflict,refugee",
  "map,scale,gis,remote sensing,gps,inquiry,data,contour,latitude,longitude,projection,graph",
];
const GEOG: Curriculum = {
  9: geo("Geological History and Topography of Ethiopia; Climate of Ethiopia; Natural Resource Base of Ethiopia; Population and Demographic Characteristics of Ethiopia; Major Economic and Cultural Activities in Ethiopia; Human–Natural Environment Interactions in Ethiopia; Contemporary Geographic Issues and Public Concerns in Ethiopia; Geographic Inquiry Skills and Techniques", GEO_KW),
  10: geo("Landforms of Africa; Climate of Africa; Natural Resource Base of Africa; Population of Africa; Major Economic and Cultural Activities of Africa; Human–Natural Environment Interactions; Geographic Issues and Public Concerns in Africa; Geospatial Information and Data Processing", GEO_KW),
  11: geo("Formation of the Continents; Climate Classification and Climate Regions of Our World; Natural Resources and Conflicts Over Resources; Global Population Dynamics and Challenges; Geography and Economic Development; Major Global Environmental Changes; Geographic Issues and Public Concerns; Geo-spatial Information and Data Processing",
    ["continent,pangaea,continental drift,plate","koppen,climate region,climate classification","conflict over,resource","population dynamics,demographic transition","economic development,gdp,industrialization","global environmental,ozone,global warming","issue,concern,globalization","gis,remote sensing,gps,spatial,map"]),
  12: geo("Major Geological Processes Associated with Plate Tectonics; Climate Change; Management of Conflict Over Resources; Population Policies, Programs and the Environment; Challenges of Economic Development; Solutions to Environmental and Sustainability Problems; Contemporary Global Geographic Issues and Public Concerns; Geographical Enquiry and Map Making",
    ["plate tectonic,earthquake,volcano,fold,fault,subduction","climate change,greenhouse,carbon,warming,adaptation,mitigation","conflict management,transboundary,nile,water conflict","population policy,family planning,program","challenge,poverty,debt,underdevelopment","sustainab,renewable,conservation,afforestation","contemporary,global issue,pandemic,migration crisis","enquiry,map making,survey,questionnaire,cartograph"]),
};

const ENG: Curriculum = {
  9: [
    ["Vocabulary", "meaning,synonym,antonym,closest in meaning,opposite,word"],
    ["Tenses", "tense,present,past,future,has been,had been,will have,yesterday,since,for"],
    ["Articles and Determiners", "article,a,an,the,determiner,some,any,much,many"],
    ["Prepositions", "preposition,in,on,at,by,with,of"],
    ["Reading Comprehension", "passage,according to,paragraph,author,writer,main idea,text"],
  ],
  10: [
    ["Word Formation", "suffix,prefix,noun form,adjective form,word formation"],
    ["Modal Verbs", "modal,must,should,might,could,may,ought"],
    ["Conditionals", "if,unless,conditional,would have,provided"],
    ["Adjectives and Adverbs", "adjective,adverb,comparative,superlative,than"],
    ["Reading Comprehension", "passage,according to,infer,inference,title"],
  ],
  11: [
    ["Passive Voice", "passive,was written,been made,by the"],
    ["Reported Speech", "reported,said that,asked,told,indirect speech,direct speech"],
    ["Relative Clauses", "who,whom,whose,which,that,relative clause"],
    ["Gerunds and Infinitives", "gerund,infinitive,to do,-ing"],
    ["Idioms and Phrasal Verbs", "idiom,phrasal verb,expression,look after,give up,put off"],
  ],
  12: [
    ["Sentence Structure and Conjunctions", "conjunction,although,however,therefore,despite,whereas,clause,sentence"],
    ["Subject–Verb Agreement", "agreement,is,are,was,were,neither,either,each"],
    ["Punctuation and Writing", "punctuation,comma,paragraph order,coherent,topic sentence,writing,rearrange"],
    ["Error Identification", "error,incorrect,mistake,underlined,correct form"],
    ["Advanced Reading Comprehension", "passage,according to,tone,attitude,purpose,implied"],
  ],
};

const SAT: Curriculum = {
  9: [
    ["Verbal Analogies", "analogy,is to,::,relationship"],
    ["Odd One Out", "odd one,does not belong,different from"],
    ["Number Series", "series,sequence,next number,missing number,pattern"],
    ["Basic Arithmetic", "percent,ratio,fraction,average,sum"],
  ],
  10: [
    ["Logical Reasoning", "if all,some,conclusion,statement,therefore,logic,assume"],
    ["Coding and Decoding", "code,coded,written as,cipher"],
    ["Word Problems", "age,work,speed,distance,time,train,pipe"],
    ["Letter Series", "letter,alphabet"],
  ],
  11: [
    ["Data Interpretation", "table,graph,chart,data,figure shows"],
    ["Blood Relations and Directions", "brother,sister,father,mother,son,daughter,north,south,east,west,direction"],
    ["Sentence Completion", "complete,blank,best completes"],
    ["Algebraic Reasoning", "equation,x,value of,solve"],
  ],
  12: [
    ["Critical Reading", "passage,according to,inference,author"],
    ["Spatial Reasoning", "cube,figure,shape,mirror image,fold,rotate,dice"],
    ["Quantitative Comparison", "greater,less,compare,column"],
    ["Mixed Aptitude", "puzzle,arrangement,seating,rank,order"],
  ],
};

const histCurr = (): Curriculum => {
  const out: Curriculum = {};
  for (const g of [9, 10, 11, 12]) {
    const kw = g === 9 || g === 11 ? HIST_KW_A : HIST_KW_B;
    out[g] = HISTORY[g].map(([t], i) => [t, kw[i] ?? ""]);
  }
  return out;
};

const CURRICULA: Record<number, Curriculum> = {
  1: MATH, 2: ENG, 3: PHYS, 4: CHEM, 5: BIO, 6: histCurr(), 7: GEOG, 8: ECON, 9: SAT,
};

const STOP = new Set(["and","the","of","to","in","on","its","their","a","an","for","with","our","some","introduction","further","basic","basics","important","main","major","since","up","c.","at","by","is","are"]);

function keywordsFor(title: string, extra: string): string[] {
  const fromTitle = title.toLowerCase().replace(/[(),:–—-]/g, " ").split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w) && !/^\d/.test(w));
  const ex = extra.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return Array.from(new Set([...ex, ...fromTitle]));
}

function matches(hay: string, kw: string): boolean {
  // Short/alpha keywords use word boundaries; others use substring match.
  if (/^[a-z]+$/.test(kw) && kw.length <= 4) {
    return new RegExp(`\\b${kw}\\b`).test(hay);
  }
  return hay.includes(kw);
}

export type UnitBucket = { unit: number; title: string; questions: Question[] };
export type GradeBucket = { grade: number; units: UnitBucket[] };

/** Sort a paper's real questions into curriculum units (best keyword match). */
export function groupPaperByUnits(subjectId: number, questions: Question[]): GradeBucket[] {
  const curr = CURRICULA[subjectId] ?? MATH;
  const grades = [12, 11, 10, 9];
  const buckets: GradeBucket[] = grades.map((g) => ({
    grade: g,
    units: (curr[g] ?? []).map(([title], i) => ({ unit: i + 1, title, questions: [] })),
  }));
  const index = grades.flatMap((g, gi) =>
    (curr[g] ?? []).map(([title, extra], ui) => ({ gi, ui, kws: keywordsFor(title, extra) })),
  );
  for (const q of questions) {
    if (q.text.includes("Paper not yet published")) continue;
    const hay = `${q.text} ${q.options.join(" ")}`.toLowerCase();
    let best: { gi: number; ui: number; score: number } | null = null;
    for (const u of index) {
      let score = 0;
      for (const k of u.kws) if (matches(hay, k)) score += k.includes(" ") ? 2 : 1;
      if (score > 0 && (!best || score > best.score)) best = { gi: u.gi, ui: u.ui, score };
    }
    if (best) buckets[best.gi].units[best.ui].questions.push(q);
  }
  return buckets;
}
