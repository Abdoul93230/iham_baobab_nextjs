"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { shuffle } from "lodash";
import ProduitPage from "../produit/ProduitPage";
import SliderPage from "../slider/SliderPage";
import { useAppSelector } from "@/redux/hooks";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import CategorieMobile from "./CategorieMobile";

interface HomeMainProps {
  isOpen: boolean;
}

interface Product {
  _id: string;
  name: string;
  prix: number;
  image1: string;
  ClefType?: string;
}

interface Category {
  _id: string;
  name: string;
  image: string;
}

interface Type {
  _id: string;
  clefCategories?: string;
}

const carouselImages = ["/pub1.jpg", "/pub2.jpg"];

const HomeMain: React.FC<HomeMainProps> = ({ isOpen }) => {
  const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;
  const swiperRef = useRef<any>(null);
  const router = useRouter();

  const DATA_Products = useAppSelector((state) => state.products.data) as Product[];
  const DATA_Types = useAppSelector((state) => state.products.types) as Type[];
  const DATA_Categories = useAppSelector((state) => state.products.categories) as Category[];
  const DATA_Pubs = useAppSelector((state) => state.products.products_Pubs);

  const clefElectronique = DATA_Categories
    ? DATA_Categories.find((item) => item.name === "électroniques")
    : null;

  function getRandomElements(array: any[]): any[] {
    const shuffledArray = shuffle(array);
    return shuffledArray.slice(0, 10);
  }

  function getRandomElementsSix(array: any[]): any[] {
    const shuffledArray = shuffle(array);
    return shuffledArray.slice(0, 4);
  }

  function getRandomElementss(array: any[], nbr: number): any[] {
    const shuffledArray = shuffle(array);
    return shuffledArray.slice(0, nbr);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-2">
        {/* Ajout d'un padding supérieur pour le contenu principal */}
        <div className="flex flex-col md:flex-row gap-8">
          <aside
            className={`md:w-1/4 bg-white rounded-lg mt-4 shadow-md p-4 ${
              isOpen ? "block" : "hidden md:block"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-[#30A08B]">
              Catégories
            </h2>
            <ul>
              {DATA_Categories.map((category) => {
                if (category.name === "all") {
                  return null;
                }
                return (
                  <li
                    key={category._id}
                    onClick={() => router.push(`/Categorie/${category.name}`)}
                    className="mb-2"
                  >
                    <button className="w-full text-left py-2 px-4 rounded hover:bg-[#FFE9CC] transition-colors duration-200 flex items-center space-x-2">
                      <Image
                        src={category?.image}
                        alt="loading"
                        width={30}
                        height={30}
                        className="object-contain rounded-full"
                      />
                      <span>{category?.name}</span>
                    </button>
                  </li>
                );
              })}
              <li className="mb-2" onClick={() => router.push("/Voir-plus")}>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-[#FFE9CC] transition-colors duration-200 flex items-center space-x-2">
                  <span>➡️</span>
                  <span>Voir plus</span>
                </button>
              </li>
              <div className="mt-8">
                <div className="w-full overflow-hidden">
                  {carouselImages.map((image, index) => {
                    return (
                      <Image
                        key={index}
                        src={image}
                        alt=""
                        width={240}
                        height={160}
                        className="w-full h-auto object-cover rounded-lg mb-2 max-w-full"
                      />
                    );
                  })}
                </div>
              </div>
            </ul>
          </aside>

          {/* Carousel and Products */}
          <div className="md:w-3/4">
            {/* Carousel */}
            <section className="my-6 relative">
              <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                className="mb-8 rounded-lg overflow-hidden"
              >
                {DATA_Pubs.map((param: any, index: number) => (
                  <SwiperSlide key={index}>
                    <Image
                      src={param.image}
                      alt={`Slide ${index + 1}`}
                      width={800}
                      height={400}
                      className="w-full h-[400px] object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Flèches personnalisées */}
              <div
                className="absolute z-10 top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 bg-[#30A08B] text-white rounded-full p-2 cursor-pointer flex items-center justify-center"
                onClick={() => swiperRef.current?.swiper.slidePrev()}
              >
                <span className="text-lg">←</span>
              </div>
              <div
                className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 bg-[#30A08B] text-white rounded-full p-2 cursor-pointer flex items-center justify-center"
                onClick={() => swiperRef.current?.swiper.slideNext()}
              >
                <span className="text-lg">→</span>
              </div>
            </section>

            <CategorieMobile />

            {/* Featured Products */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-[#30A08B]">
                Produits vedettes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getRandomElementss(DATA_Products, 4).map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="relative">
                      <Image
                        src={product.image1}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover transition-transform duration-200"
                      />
                      <span className="absolute top-2 right-2 bg-[#30A08B] text-white text-xs font-bold px-2 rounded-full">
                        Nouveau
                      </span>

                      <div
                        onClick={() =>
                          router.push(`/ProduitDétail/${product._id}`)
                        }
                        className="absolute inset-0 bg-gradient-to-b from-transparent to-[#30A08B] opacity-30 group-hover:scale-105 transition-transform duration-300"
                      ></div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {product.name.slice(0, 20)}...
                      </h3>
                      <p className="text-[#B17236] font-bold text-lg">
                        {product.prix} FCFA
                      </p>
                      <button
                        onClick={() =>
                          router.push(`/ProduitDétail/${product._id}`)
                        }
                        className="mt-2 flex justify-around items-center w-full bg-[#30A08B] text-white py-2 rounded-full hover:bg-opacity-90 transition transition-colors duration-200 text-sm md:text-base shadow-md hover:shadow-lg"
                      >
                        Ajouter au panier
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Flash Sale Section */}
        <div className="flex overflow-x-auto mt-3" style={{ overflowY: "hidden" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((card, index) => (
            <div key={index} className="mr-3">
              <div className="w-32 border border-gray-300 h-32 overflow-hidden rounded-lg">
                <Image
                  src="https://zz.jumia.is/cms/Coupon_Corner_TN300x300.jpg"
                  alt={`Publication ${card}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover transition-transform transform hover:scale-105"
                />
              </div>
              <p className="text-center">Flash Sale</p>
            </div>
          ))}
        </div>

        {/* Électroniques Section */}
        <ProduitPage
          products={getRandomElementsSix(
            DATA_Products?.filter((item) =>
              DATA_Types.some(
                (type) =>
                  type.clefCategories === clefElectronique?._id &&
                  item.ClefType === type._id
              )
            )
          )}
          name={"électroniques"}
        />
        <SliderPage
          products={getRandomElements(
            DATA_Products.filter((item) =>
              DATA_Types.some(
                (type) =>
                  type.clefCategories === clefElectronique?._id &&
                  item.ClefType === type._id
              )
            )
          )}
          name={"électroniques"}
        />

        {/* Autres catégories */}
        {DATA_Categories.map((param, index) => {
          if (
            getRandomElements(
              DATA_Products.filter(
                (item) =>
                  item.ClefType ===
                  DATA_Types.find((i) => i.clefCategories === param._id)?._id
              )
            ).length > 0 &&
            param._id !== clefElectronique?._id
          ) {
            return (
              <div key={index}>
                <ProduitPage
                  products={getRandomElementsSix(
                    DATA_Products.filter((item) =>
                      DATA_Types.some(
                        (type) =>
                          type.clefCategories === param?._id &&
                          item.ClefType === type._id
                      )
                    )
                  )}
                  name={param.name}
                />
                <SliderPage
                  products={getRandomElements(
                    DATA_Products.filter((item) =>
                      DATA_Types.some(
                        (type) =>
                          type.clefCategories === param?._id &&
                          item.ClefType === type._id
                      )
                    )
                  )}
                  name={param.name}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
      </main>
    </div>
  );
};

export default HomeMain;
