import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  // Geral
  Circle, Star, Heart, Bookmark, Flag, Gear, Clock, Calendar, Bell, Scissors,
  Sun, Moon, Drop, Leaf, Flower, Fire, Lightning, Confetti, Balloon,
  // Alimentação & Bebidas
  ForkKnife, Coffee, Wine, Hamburger, Pizza, Cookie, Cake, Bread, BowlFood,
  CookingPot, Carrot, Orange, BeerStein, Champagne, ChefHat,
  // Transporte
  Car, Bus, Train, Airplane, Motorcycle, Bicycle, GasPump, Boat,
  // Moradia
  House, Buildings, Bed, Couch, Lightbulb, Wrench, PaintBucket, Bathtub,
  Broom, Dresser,
  // Saúde & Fitness
  Heartbeat, FirstAid, Pill, Hospital, Stethoscope, Tooth, Bandaids,
  Barbell, PersonSimpleRun, PersonSimpleSwim, PersonSimpleBike, SoccerBall,
  Basketball, TennisBall,
  // Beleza & Cuidado Pessoal
  Sparkle, HandSoap, HairDryer,
  // Lazer
  GameController, MusicNotes, FilmSlate, Ticket, Guitar, Television,
  // Educação
  BookOpen, GraduationCap, Pencil, Student, ChalkboardTeacher,
  // Trabalho
  Briefcase, Handshake, BuildingOffice, Newspaper,
  // Finanças
  Wallet, CreditCard, Coins, Bank, Receipt, PiggyBank, CurrencyDollar, HandCoins,
  // Compras
  ShoppingCart, ShoppingBag, Gift, Tag, Storefront, Handbag, TShirt, Dress, Sneaker,
  // Tecnologia
  Laptop, DeviceMobile, Headphones, Camera, Watch, WifiHigh,
  // Viagem
  Suitcase, MapPin, Compass, Tent, Umbrella,
  // Família
  Baby, BabyCarriage,
  // Pets & Natureza
  PawPrint, Dog, Tree, Fish,
} from "@phosphor-icons/react";

export type PhosphorIconComponent = PhosphorIcon;

export const PHOSPHOR_ICON_MAP: Record<string, PhosphorIcon> = {
  // Geral
  circle: Circle,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  flag: Flag,
  gear: Gear,
  clock: Clock,
  calendar: Calendar,
  bell: Bell,
  scissors: Scissors,
  sun: Sun,
  moon: Moon,
  drop: Drop,
  leaf: Leaf,
  flower: Flower,
  fire: Fire,
  lightning: Lightning,
  confetti: Confetti,
  balloon: Balloon,
  // Alimentação & Bebidas
  "fork-knife": ForkKnife,
  coffee: Coffee,
  wine: Wine,
  hamburger: Hamburger,
  pizza: Pizza,
  cookie: Cookie,
  cake: Cake,
  bread: Bread,
  "bowl-food": BowlFood,
  "cooking-pot": CookingPot,
  carrot: Carrot,
  orange: Orange,
  "beer-stein": BeerStein,
  champagne: Champagne,
  "chef-hat": ChefHat,
  // Transporte
  car: Car,
  bus: Bus,
  train: Train,
  airplane: Airplane,
  motorcycle: Motorcycle,
  bicycle: Bicycle,
  "gas-pump": GasPump,
  boat: Boat,
  // Moradia
  house: House,
  buildings: Buildings,
  bed: Bed,
  couch: Couch,
  lightbulb: Lightbulb,
  wrench: Wrench,
  "paint-bucket": PaintBucket,
  bathtub: Bathtub,
  broom: Broom,
  dresser: Dresser,
  // Saúde & Fitness
  heartbeat: Heartbeat,
  "first-aid": FirstAid,
  pill: Pill,
  hospital: Hospital,
  stethoscope: Stethoscope,
  tooth: Tooth,
  bandaids: Bandaids,
  barbell: Barbell,
  "person-simple-run": PersonSimpleRun,
  "person-simple-swim": PersonSimpleSwim,
  "person-simple-bike": PersonSimpleBike,
  "soccer-ball": SoccerBall,
  basketball: Basketball,
  "tennis-ball": TennisBall,
  // Beleza & Cuidado Pessoal
  sparkle: Sparkle,
  "hand-soap": HandSoap,
  hairdryer: HairDryer,
  // Lazer
  "game-controller": GameController,
  "music-notes": MusicNotes,
  "film-slate": FilmSlate,
  ticket: Ticket,
  guitar: Guitar,
  television: Television,
  // Educação
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  pencil: Pencil,
  student: Student,
  "chalkboard-teacher": ChalkboardTeacher,
  // Trabalho
  briefcase: Briefcase,
  handshake: Handshake,
  "building-office": BuildingOffice,
  newspaper: Newspaper,
  // Finanças
  wallet: Wallet,
  "credit-card": CreditCard,
  coins: Coins,
  bank: Bank,
  receipt: Receipt,
  "piggy-bank": PiggyBank,
  "currency-dollar": CurrencyDollar,
  "hand-coins": HandCoins,
  // Compras
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  gift: Gift,
  tag: Tag,
  storefront: Storefront,
  handbag: Handbag,
  "t-shirt": TShirt,
  dress: Dress,
  sneaker: Sneaker,
  // Tecnologia
  laptop: Laptop,
  "device-mobile": DeviceMobile,
  headphones: Headphones,
  camera: Camera,
  watch: Watch,
  "wifi-high": WifiHigh,
  // Viagem
  suitcase: Suitcase,
  "map-pin": MapPin,
  compass: Compass,
  tent: Tent,
  umbrella: Umbrella,
  // Família
  baby: Baby,
  "baby-carriage": BabyCarriage,
  // Pets & Natureza
  "paw-print": PawPrint,
  dog: Dog,
  tree: Tree,
  fish: Fish,
};

export const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: "Geral",
    icons: ["circle", "star", "heart", "bookmark", "flag", "gear", "clock", "calendar", "bell", "scissors", "sun", "moon", "drop", "leaf", "flower", "fire", "lightning", "confetti", "balloon"],
  },
  {
    label: "Alimentação & Bebidas",
    icons: ["fork-knife", "coffee", "wine", "hamburger", "pizza", "cookie", "cake", "bread", "bowl-food", "cooking-pot", "carrot", "orange", "beer-stein", "champagne", "chef-hat"],
  },
  {
    label: "Transporte",
    icons: ["car", "bus", "train", "airplane", "motorcycle", "bicycle", "gas-pump", "boat"],
  },
  {
    label: "Moradia",
    icons: ["house", "buildings", "bed", "couch", "lightbulb", "wrench", "paint-bucket", "bathtub", "broom", "dresser"],
  },
  {
    label: "Saúde & Fitness",
    icons: ["heartbeat", "first-aid", "pill", "hospital", "stethoscope", "tooth", "bandaids", "barbell", "person-simple-run", "person-simple-swim", "person-simple-bike", "soccer-ball", "basketball", "tennis-ball"],
  },
  {
    label: "Beleza & Cuidado Pessoal",
    icons: ["sparkle", "hand-soap", "hairdryer", "scissors"],
  },
  {
    label: "Lazer",
    icons: ["game-controller", "music-notes", "film-slate", "ticket", "guitar", "television"],
  },
  {
    label: "Educação",
    icons: ["book-open", "graduation-cap", "pencil", "student", "chalkboard-teacher"],
  },
  {
    label: "Trabalho",
    icons: ["briefcase", "handshake", "building-office", "newspaper"],
  },
  {
    label: "Finanças",
    icons: ["wallet", "credit-card", "coins", "bank", "receipt", "piggy-bank", "currency-dollar", "hand-coins"],
  },
  {
    label: "Compras & Moda",
    icons: ["shopping-cart", "shopping-bag", "gift", "tag", "storefront", "handbag", "t-shirt", "dress", "sneaker"],
  },
  {
    label: "Tecnologia",
    icons: ["laptop", "device-mobile", "headphones", "camera", "watch", "wifi-high"],
  },
  {
    label: "Viagem",
    icons: ["suitcase", "map-pin", "compass", "tent", "umbrella"],
  },
  {
    label: "Família",
    icons: ["baby", "baby-carriage", "heart", "balloon"],
  },
  {
    label: "Pets & Natureza",
    icons: ["paw-print", "dog", "fish", "tree"],
  },
];

export const PHOSPHOR_ICON_NAMES = Object.keys(PHOSPHOR_ICON_MAP);
