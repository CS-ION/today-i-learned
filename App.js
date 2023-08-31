import "./style.css";
import { useEffect, useState } from "react";
import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currCat, setCurrCat] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currCat !== "all") query = query.eq("category", currCat);

        const { data: facts, error } = await query
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error) setFacts(facts);
        else alert("Cannot Load Data!");
        setIsLoading(false);
      }
      getFacts();
    },
    [currCat]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrCat={setCurrCat} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="loading">Loading ... Please Wait </p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="TIL Logo" />
        <h1>Today I Learned!</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {" "}
        {showForm ? "Close" : "Share a fact!"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);

      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select("*");

      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      else alert("Error! Cannot insert into database");

      setIsUploading(false);
      setShowForm(false);
    } else {
      alert("Please enter valid details in the form!");
    }
  }

  return (
    <form className="fact-share" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share your fact...."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Enter your source...."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose Category:</option>
        {CATEGORIES.map((element) => (
          <option value={element.name}>{element.name}</option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        POST
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrCat }) {
  return (
    <aside>
      <ul className="category-list">
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrCat("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((element) => (
          <li className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: element.color }}
              onClick={() => setCurrCat(element.name)}
            >
              {element.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return <p>No facts for this category yet!</p>;
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.v_interest + fact.v_mindblow < fact.v_false;
  async function handleVote(value) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [value]: fact[value] + 1 })
      .eq("id", fact.id)
      .select("*");
    setIsUpdating(false);
    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? (
          <span className="disputed">
            <strong>[DISPUTED🔴]</strong>{" "}
          </span>
        ) : null}
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("v_interest")} disabled={isUpdating}>
          👍{fact.v_interest}
        </button>
        <button onClick={() => handleVote("v_mindblow")} disabled={isUpdating}>
          🤯{fact.v_mindblow}
        </button>
        <button onClick={() => handleVote("v_false")} disabled={isUpdating}>
          ⛔️{fact.v_false}
        </button>
      </div>
    </li>
  );
}

export default App;
