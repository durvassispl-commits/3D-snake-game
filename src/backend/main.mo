import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type Entry = {
    playerName : Text;
    score : Nat;
  };

  module Entry {
    public func compareByScore(entry1 : Entry, entry2 : Entry) : Order.Order {
      switch (Nat.compare(entry2.score, entry1.score)) {
        case (#equal) { Text.compare(entry1.playerName, entry2.playerName) };
        case (order) { order };
      };
    };
  };

  let leaderboard = Map.empty<Text, Nat>();

  public shared ({ caller }) func submitScore(playerName : Text, score : Nat) : async () {
    let currentScore = switch (leaderboard.get(playerName)) {
      case (null) { 0 };
      case (?existing) { existing };
    };
    let finalScore = Nat.max(currentScore, score);
    leaderboard.add(playerName, finalScore);
  };

  public query ({ caller }) func getTopEntries() : async [Entry] {
    leaderboard.entries().map(func((name, score)) { { playerName = name; score } })
    .toArray()
    .sort(Entry.compareByScore)
    .sliceToArray(0, Nat.min(10, leaderboard.size()));
  };

  public query ({ caller }) func getAllEntries() : async [Entry] {
    leaderboard.entries().map(func((name, score)) { { playerName = name; score } }).toArray();
  };

  public query ({ caller }) func getPersonalBest(playerName : Text) : async Nat {
    switch (leaderboard.get(playerName)) {
      case (null) { Runtime.trap("No personal best found.") };
      case (?score) { score };
    };
  };
};
