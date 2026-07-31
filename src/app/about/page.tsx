import type { Metadata } from "next";
import Header from "../../components/header";
import Footer from "../../components/footer";

export const metadata: Metadata = {
  title: "Newton-ის შესახებ — Newton",
};

export default function AboutPage() {
  return (
    <>
    <title>შესახებ - Newton</title>
      <meta
        name="description"
        content="პლატფორმა ნიუტონის შესახებ, მისი მიზნები და კონფიდენციალურობის პოლიტიკა"
      />
      <Header />
      <main className="container" style={{ paddingTop: "48px" }}>
        <div>
          <h2>Newton-ის შესახებ</h2>
          <p>
            Newton არის უფასო საგანმანათლებლო პლატფორმა, რომელიც შექმნილია
            ფიზიკის შესწავლის გასაადვილებლად ქართულ ენაზე. პლატფორმა
            წარმოადგენს პირად, დამოუკიდებელ პროექტს და არ არის დაკავშირებული
            საქართველოს განათლების სამინისტროსთან ან რომელიმე ოფიციალურ
            საგანმანათლებლო დაწესებულებასთან.
          </p>
        </div>

        <div>
          <h2>მასალის შესახებ</h2>
          <p>
            საიტზე განთავსებული ფორმულები და მასალები განკუთვნილია
            დამატებითი სასწავლო რესურსის სახით და არ ცვლის ოფიციალურ
            სახელმძღვანელოებსა და მასწავლებლის მითითებებს. მასალაში
            შესაძლოა შეგხვდეთ უზუსტობა — თუ შეამჩნევთ შეცდომას, გთხოვთ
            დამიკავშირდეთ{" "}
            <a href="mailto:giorgibezhiashvili5@gmail.com" className="cardLink">
              giorgibezhiashvili5@gmail.com
            </a>
            , რომ დროულად გამოვასწორო.
          </p>
        </div>

        <div>
          <h2>კონფიდენციალურობა</h2>
          <p>
            საიტი ამჟამად არ აგროვებს პირად მონაცემებს, არ საჭიროებს
            რეგისტრაციას და არ იყენებს ქუქი-ფაილებს ან თვალთვალის
            სისტემებს.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
