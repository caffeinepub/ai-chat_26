import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";

actor {
  type Message = {
    role : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type Session = {
    id : Nat;
    title : Text;
    messages : [Message];
  };

  module Session {
    public func compare(session1 : Session, session2 : Session) : {
      #less;
      #equal;
      #greater;
    } {
      Nat.compare(session1.id, session2.id);
    };
  };

  var nextSessionId = 0;

  let sessions = Map.empty<Nat, Session>();

  public shared ({ caller }) func createSession(title : Text) : async Nat {
    let sessionId = nextSessionId;
    nextSessionId += 1;

    let session : Session = {
      id = sessionId;
      title;
      messages = [];
    };

    sessions.add(sessionId, session);
    sessionId;
  };

  public shared ({ caller }) func addMessage(sessionId : Nat, role : Text, content : Text) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let message : Message = {
          role;
          content;
          timestamp = Time.now();
        };

        let messagesList = List.fromArray<Message>(session.messages);
        messagesList.add(message);
        let updatedMessages = messagesList.toArray();

        let updatedSession : Session = {
          id = session.id;
          title = session.title;
          messages = updatedMessages;
        };
        sessions.add(sessionId, updatedSession);
      };
    };
  };

  public query ({ caller }) func getSessions() : async [Session] {
    sessions.values().toArray().sort();
  };

  public query ({ caller }) func getMessages(sessionId : Nat) : async [Message] {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) { session.messages };
    };
  };
};
