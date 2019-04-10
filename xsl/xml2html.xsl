<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:owl="http://www.w3.org/2002/07/owl#"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:dcndl="http://ndl.go.jp/dcndl/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<xsl:output method="html" />
	<xsl:template match="/">
		<xsl:apply-templates select=".//rdf:RDF" />
	</xsl:template>
	<xsl:template match="rdf:RDF">
		<li class="list-group-item">
			<h2 class="title">
				<a target="_blank">
					<xsl:attribute name="href">
						<xsl:value-of select=".//dcndl:BibAdminResource/@rdf:about" />
					</xsl:attribute>
					<xsl:value-of select=".//dcterms:title" />
				</a>
			</h2>
			<p class="data">
				<xsl:value-of select=".//dc:creator" />
				<xsl:text> </xsl:text>
				<xsl:value-of select=".//dcterms:publisher//foaf:name" />
				<xsl:text> （</xsl:text>
				<xsl:value-of select=".//dcterms:date" />
				<xsl:text>）</xsl:text>
				<xsl:apply-templates select=".//dcterms:extent" />
			</p>
		</li>
	</xsl:template>
	<xsl:template match="dcterms:extent">
		<span class="extent">
			<xsl:text>【</xsl:text>
			<xsl:value-of select="." />
			<xsl:text>】</xsl:text>
		</span>
	</xsl:template>
</xsl:stylesheet>

