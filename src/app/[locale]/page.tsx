import { notFound } from "next/navigation";
import { GeneratorPage } from "@/components/GeneratorPage";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <GeneratorPage locale={locale} dict={getDictionary(locale)} />;
}
