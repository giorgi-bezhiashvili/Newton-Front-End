"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { fetchDailyStreak } from "../utils/streak";

function Middle() {
  const { auth, setAccessToken } = useAuth();
  const [dailyStreak, setDailyStreak] = useState(0);

  useEffect(() => {
    if (!auth) {
      setDailyStreak(0);
      return;
    }
    fetchDailyStreak(auth.accessToken, auth.refreshToken, setAccessToken)
      .then(setDailyStreak)
      .catch(() => setDailyStreak(0));
  }, [auth, setAccessToken]);
  return (
    <main>
      {/* The Hero Banner directly below the nav header */}
      <div className="simple-what-is">
        <div className="hero-text-block">
          <div className="title">
            <span>NEWTON</span>
          </div>
          <p>
            ისწავლე ფიზიკა, მარტივად ახსნილი თემებით , ორგანიზებული
            გაკვეთილებით, ფორმულებით, ქვიზებით და სკოლის მოსწავლეების მიერ გაკეთებული რესურსებით.
          </p>

          {dailyStreak > 0 && (
            <div className="streakBadge daily heroStreakBadge">
              <span className="streakIcon">🔥</span>
              <span>{dailyStreak} დღიანი სერია</span>
            </div>
          )}

          <a href="#start-learning">
            <button type="button">დაიწყე სწავლა ➜</button>
          </a>
        </div>

        <div className="vidContainer">
          <iframe
            width="560"
            height="315"
            sandbox="allow-scripts allow-same-origin allow-popups"
            src="https://www.youtube.com/embed/K0SwpS324d8?si=wOGhIsdV6E23Xk7T"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="ytVideo"
          ></iframe>
        </div>
      </div>

      <div className="container">
        <div className="what-is-newton-div">
          <h2>რა არის ნიუტონი</h2>
          <p className="whatIs">
            ნიუტონი არის ინტერაქტიული ონლაინ სასწავლო პლატფორმა, რომელიც
            შექმნილია იმისთვის, რომ ფიზიკის სამყარო ხელმისაწვდომი, მიმზიდველი და
            მარტივი ათვისება გახადოს. იქნება ეს სტუდენტი, რომელიც აკადემიური
            წარმატებისკენ მიისწრაფვის, პედაგოგი, რომელიც სანდო რესურსებს ეძებს
            თუ ცნობისმოყვარე გონება, რომელიც ცდილობს გაიგოს ჩვენი სამყაროს
            მარეგულირებელი კანონები, ნიუტონი რთულ სამეცნიერო კონცეფციებს ადვილად
            აღსაქმელ, ინტუიციურ გაკვეთილებად ყოფს. კლასიკური მექანიკიდან
            თანამედროვე კვანტურ თეორიებამდე, პლატფორმა აერთიანებს მკაფიო
            განმარტებებს პრაქტიკულ მაგალითებთან, ცვლის თქვენს შეხედულებას
            ფიზიკურ სამყაროზე და ქმნის მყარ საფუძველს თქვენი ფიზიკის
            მოგზაურობისთვის.
          </p>
        </div>

        <div className="why-newton-div">
          <h2>რატომ ნიუტონი?</h2>
          <p className="why">
            კეთილი იყოს თქვენი მობრძანება ნიუტონში, თქვენს საუკეთესო ონლაინ
            დანიშნულების ადგილას, სადაც შეგიძლიათ დაეუფლოთ სამყაროს კანონებს.
            შექმნილია სტუდენტებისთვის, პედაგოგებისთვის და ცნობისმოყვარე
            გონებისთვის, ნიუტონი ფიზიკას გარდაქმნის საშიში საგნიდან აღმოჩენების
            საინტერესო მოგზაურობად. ჩვენ რთულ კონცეფციებს - კლასიკური
            მექანიკიდან თანამედროვე თეორიებამდე - ვშლით გასაგებ, მოკლე
            გაკვეთილებად, რომლებიც ხაზს უსვამენ რეალური სამყაროს გაგებას ნედლი
            მასალის დამახსოვრების ნაცვლად. ემზადებით თუ არა თქვენი შემდეგი
            მნიშვნელოვანი გამოცდისთვის თუ უბრალოდ გსურთ იცოდეთ, როგორ მუშაობს
            სამყარო, ნიუტონი გთავაზობთ ინსტრუმენტებს, სიცხადეს და შთაგონებას,
            რომელიც გჭირდებათ წარმატების მისაღწევად.
          </p>
        </div>

        <div className="what-is-here-div">
          <h2>რას იპოვით აქ?</h2>
          <p className="whatIsHere">
            ნიუტონის გაკვეთილებში ფიზიკის შესწავლა აქტიური გამოცდილებაა.
            შეისწავლეთ ჩვენი ყოვლისმომცველი გაკვეთილების ბიბლიოთეკა, რომელიც
            ამარტივებს რთულ თეორიებს გასაგებ, ყოველდღიურ კონცეფციებად.
            გამოსცადეთ თქვენი ცოდნა პრაქტიკული ქვიზებით, რომელთა ამოხსნაც
            თავად შეგიძლიათ, რათა დაეუფლოთ პრობლემების გადაჭრის უნარებს. გარდა
            ამისა, მიიღეთ შთაგონება მსოფლიოს სხვადასხვა კუთხიდან თანატოლების
            სტუდენტების მიერ გაკეთებული რესურსების შესწავლით, რომლებიც ზუსტად გაჩვენებთ, თუ
            როგორ გამოიყენება ფიზიკა რეალურ სამყაროში ინოვაციებისთვის.
            ყველაფერი, რაც გჭირდებათ სწავლისთვის, პრაქტიკისთვის და შექმნისთვის,
            აქ არის.
          </p>
        </div>

        <div className="resource-nav-div" id="start-learning">
          <h2>დაიწყე სწავლა</h2>
          <div className="resourceGrid">
            <Link href="/formulas" className="resourceCard">
              <h3>ფორმულები</h3>
              <p>
                ფიზიკის ფორმულების სრული კრებული, კლასების მიხედვით დაჯგუფებული.
              </p>
              <span className="resourceLink">იხილეთ ფორმულები ➜</span>
            </Link>

            <Link href="/quiz" className="resourceCard">
              <h3>ქვიზები</h3>
              <p>პრაქტიკული ქვიზები საკუთარი ცოდნის შესამოწმებლად.</p>
              <span className="resourceLink">იხილეთ ქვიზები ➜</span>
            </Link>

            <Link href="/resources" className="resourceCard">
              <h3>რესურსები</h3>
              <p>
                სტუდენტების მიერ გაკეთებული რეალური ფიზიკის რესურსები,
                შთაგონებისთვის.
              </p>
              <span className="resourceLink">იხილეთ რესურსები ➜</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
export default Middle;