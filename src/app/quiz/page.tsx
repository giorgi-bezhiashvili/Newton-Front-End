"use client";

import Header from "../../components/header";
import Footer from "../../components/footer";
import { QuizRunner } from "../../components/QuizRunner";

export default function QuizPage() {
  return (
    <>
      <title>ქვიზები — Newton</title>
      <meta name="description" content="ფიზიკის ინტერაქტიული ქვიზები მყისიერი პასუხებით და ახსნებით" />

      <div className="space-page">
        <Header />
        <main className="mainContent">
          <QuizRunner />
        </main>
        <Footer />
      </div>
    </>
  );
}
