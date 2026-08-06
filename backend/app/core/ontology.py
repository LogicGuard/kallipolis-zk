import logging
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, OWL, XSD

logger = logging.getLogger("kallipolis.ontology")

class Kallipolis ZKOntology:
    def __init__(self):
        self.graph = Graph()
        self.pg = Namespace("https://kallipolis.ai/ontology#")
        self.graph.bind("pg", self.pg)
        self._build_ontology()

    def _build_ontology(self):
        # Core Classes
        self.graph.add((self.pg.Asset, RDF.type, OWL.Class))
        self.graph.add((self.pg.Actor, RDF.type, OWL.Class))
        self.graph.add((self.pg.Action, RDF.type, OWL.Class))
        self.graph.add((self.pg.Risk, RDF.type, OWL.Class))
        self.graph.add((self.pg.Control, RDF.type, OWL.Class))

        # Security Sub-Classes
        self.graph.add((self.pg.Vulnerability, RDF.type, OWL.Class))
        self.graph.add((self.pg.Vulnerability, RDFS.subClassOf, self.pg.Risk))
        self.graph.add((self.pg.Attack, RDF.type, OWL.Class))
        self.graph.add((self.pg.Defense, RDF.type, OWL.Class))
        self.graph.add((self.pg.Defense, RDFS.subClassOf, self.pg.Control))

        # Compliance Sub-Classes
        self.graph.add((self.pg.Law, RDF.type, OWL.Class))
        self.graph.add((self.pg.ComplianceCheck, RDF.type, OWL.Class))
        self.graph.add((self.pg.Proof, RDF.type, OWL.Class))

        # Object Properties
        self.graph.add((self.pg.owns, RDF.type, OWL.ObjectProperty))
        self.graph.add((self.pg.owns, RDFS.domain, self.pg.Actor))
        self.graph.add((self.pg.owns, RDFS.range, self.pg.Asset))

        self.graph.add((self.pg.controls, RDF.type, OWL.ObjectProperty))
        self.graph.add((self.pg.controls, RDFS.domain, self.pg.Actor))
        self.graph.add((self.pg.controls, RDFS.range, self.pg.Control))

        self.graph.add((self.pg.hasRisk, RDF.type, OWL.ObjectProperty))
        self.graph.add((self.pg.hasRisk, RDFS.domain, self.pg.Asset))
        self.graph.add((self.pg.hasRisk, RDFS.range, self.pg.Risk))

        self.graph.add((self.pg.mitigates, RDF.type, OWL.ObjectProperty))
        self.graph.add((self.pg.mitigates, RDFS.domain, self.pg.Control))
        self.graph.add((self.pg.mitigates, RDFS.range, self.pg.Risk))

        self.graph.add((self.pg.exploits, RDF.type, OWL.ObjectProperty))
        self.graph.add((self.pg.exploits, RDFS.domain, self.pg.Attack))
        self.graph.add((self.pg.exploits, RDFS.range, self.pg.Vulnerability))

        logger.info(f"Kallipolis ZK Ontology initialized with {len(self.graph)} triples.")

    def add_vulnerability_instance(self, vuln_id: str, vuln_type: str, severity: str, contract_addr: str):
        vuln_uri = URIRef(f"https://kallipolis.ai/ontology#Vuln_{vuln_id}")
        contract_uri = URIRef(f"https://kallipolis.ai/ontology#Contract_{contract_addr}")
        
        self.graph.add((vuln_uri, RDF.type, self.pg.Vulnerability))
        self.graph.add((vuln_uri, RDFS.label, Literal(vuln_type, datatype=XSD.string)))
        self.graph.add((vuln_uri, self.pg.hasSeverity, Literal(severity, datatype=XSD.string)))
        self.graph.add((contract_uri, self.pg.hasRisk, vuln_uri))

    def execute_sparql_query(self, query: str):
        try:
            results = self.graph.query(query)
            return [dict((str(k), str(v)) for k, v in row.asdict().items()) for row in results]
        except Exception as e:
            logger.error(f"SPARQL execution error: {e}")
            return []

    def export_rdf_turtle(self) -> str:
        return self.graph.serialize(format="turtle")

ontology_engine = Kallipolis ZKOntology()
